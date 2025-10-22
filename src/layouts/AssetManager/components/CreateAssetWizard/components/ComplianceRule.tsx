/* eslint-disable react/jsx-props-no-spreading */
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  ClaimType,
  ConditionTarget,
  ConditionType,
  CountryCode,
  ScopeType,
} from '@polymeshassociation/polymesh-sdk/types';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Control,
  Path,
  useFieldArray,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { CopyToClipboard, Icon } from '~/components';
import { Text } from '~/components/UiKit';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { PolymeshContext } from '~/context/PolymeshContext';
import { formatDid, splitCamelCase } from '~/helpers/formatters';
import { notifyError } from '~/helpers/notifications';
import { validateDid } from '~/helpers/utils';
import { useCustomClaims } from '~/hooks/polymesh/useCustomClaims';
import {
  Button,
  ConditionAccordion,
  ConditionContent,
  ConditionHeader,
  ConditionSummary,
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldWrapper,
  IconWrapper,
  StyledClaim,
  StyledClaimContainer,
  StyledErrorMessage,
} from '../styles';
import { ComplianceRuleFormData, FormClaim, FormCondition } from '../types';
import ClaimTypeSelector from './ClaimTypeSelector';
import { ConditionSummaryText } from './ConditionSummaryText';

interface ValidationErrors {
  identity?: string;
  claims?: string;
}

interface ComplianceRuleRef {
  validateActiveCondition: () => Promise<boolean>;
}

interface ClaimData {
  scopeValue: string;
  scopeType: ScopeType | 'None';
  jurisdictionValue: string;
  selectedClaimType: ClaimType;
  customClaim: { id: BigNumber; name: string } | null;
}

interface ComplianceRuleProps {
  control: Control<ComplianceRuleFormData>;
  setValue: UseFormSetValue<ComplianceRuleFormData>;
  baseName: `complianceRules.${number}.conditions`;
  nextAssetId: string;
  isActive: boolean;
  activeConditionIndex: number | null;
  setActiveConditionIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

const targetOptions = [
  { label: 'Sender and Receiver', value: ConditionTarget.Both },
  { label: 'Sender', value: ConditionTarget.Sender },
  { label: 'Receiver', value: ConditionTarget.Receiver },
];

const conditionTypes = [
  { label: 'Has all of', value: ConditionType.IsPresent },
  { label: 'Has any of', value: ConditionType.IsAnyOf },
  { label: 'Does not have any of', value: ConditionType.IsNoneOf },
  { label: 'Is an Agent of the Asset', value: ConditionType.IsExternalAgent },
  { label: 'Is Identity', value: ConditionType.IsIdentity },
];

const DEFAULT_NEW_CONDITION: FormCondition = {
  type: ConditionType.IsPresent,
  target: ConditionTarget.Both,
  claims: [],
};

// Condition types that don't require claims
const CLAIM_FREE_CONDITION_TYPES = [
  ConditionType.IsIdentity,
  ConditionType.IsExternalAgent,
];

// Validation error messages
const VALIDATION_MESSAGES = {
  IDENTITY_DID_REQUIRED: 'Identity DID is required',
  CLAIMS_REQUIRED: 'At least one claim must be added',
} as const;

const ComplianceRule = React.forwardRef<ComplianceRuleRef, ComplianceRuleProps>(
  (
    {
      control,
      setValue,
      baseName,
      nextAssetId,
      isActive,
      activeConditionIndex,
      setActiveConditionIndex,
    },
    ref,
  ) => {
    const processedConditionTypes = useRef<Record<number, ConditionType>>({});

    const {
      fields: conditionFields,
      append: appendCondition,
      remove: removeCondition,
    } = useFieldArray<ComplianceRuleFormData>({
      control,
      name: baseName,
    });

    const conditions = useWatch<ComplianceRuleFormData>({
      control,
      name: baseName,
    }) as FormCondition[];

    const { getClaimName, claimNames } = useCustomClaims();

    const [validationErrors, setValidationErrors] = useState<
      Record<number, ValidationErrors>
    >({});
    const {
      api: { sdk },
    } = useContext(PolymeshContext);

    const countryLookup = useMemo(() => {
      return new Map(countryCodes.map(({ code, name }) => [code, name]));
    }, []);

    useEffect(() => {
      const fetchClaimNames = async () => {
        if (!conditions) return;

        const promises = conditions.flatMap((condition) =>
          (condition.claims || [])
            .filter(
              (
                claim,
              ): claim is FormClaim & {
                type: ClaimType.Custom;
                customClaimTypeId: BigNumber;
              } => claim.type === ClaimType.Custom && !!claim.customClaimTypeId,
            )
            .map(async (claim) => {
              await getClaimName(claim.customClaimTypeId);
            }),
        );

        await Promise.all(promises);
      };

      fetchClaimNames();
    }, [conditions, getClaimName]);

    const generateClaimKey = (
      claim: FormClaim,
      // conditionIndex: number,
    ): string => {
      const parts = [
        claim.type,
        claim.code || '',
        claim.customClaimTypeId?.toString() || '',
        claim.scope?.type || '',
        claim.scope?.value || '',
        // conditionIndex.toString(),
      ];
      return parts.join('-');
    };

    // Helper function to format claim labels for display
    const formatClaimLabels = (claim: FormClaim) => {
      let mainLabel = '';
      let subLabel: React.ReactNode = '';

      if (claim.type === ClaimType.Jurisdiction && claim.code) {
        const countryName = countryLookup.get(claim.code.toUpperCase());
        mainLabel = `${splitCamelCase(claim.type)} - ${countryName || claim.code}`;
      } else if (claim.type === ClaimType.Custom && claim.customClaimTypeId) {
        const claimId = claim.customClaimTypeId.toString();
        const claimName =
          claimNames[claimId] || claim.customClaimName || 'Unknown';
        mainLabel = `Custom - ID ${claimId}, ${claimName}`;
      } else {
        mainLabel = `${splitCamelCase(claim.type)}`;
      }

      if (claim.scope) {
        const scopeValue =
          claim.scope.type === ScopeType.Identity ||
          claim.scope.type === ScopeType.Asset
            ? formatDid(claim.scope.value, 8, 8)
            : claim.scope.value;

        const shouldShowCopyButton =
          claim.scope.type === ScopeType.Identity ||
          claim.scope.type === ScopeType.Asset;

        subLabel = (
          <>
            Scope: {claim.scope.type} -{' '}
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              {scopeValue}
              {shouldShowCopyButton && (
                <span
                  style={{
                    marginLeft: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <CopyToClipboard value={claim.scope.value} />
                </span>
              )}
            </span>
          </>
        );
      } else if (claim.type === ClaimType.Custom) {
        subLabel = 'Scope: No Scope';
      }

      return { mainLabel, subLabel };
    };

    const handleAddClaim = (
      conditionIndex: number,
      {
        scopeValue,
        scopeType,
        jurisdictionValue,
        selectedClaimType,
        customClaim,
      }: ClaimData,
    ) => {
      let newClaim: FormClaim;

      if (selectedClaimType === ClaimType.Custom && customClaim) {
        newClaim = {
          type: ClaimType.Custom,
          customClaimTypeId: customClaim.id,
          customClaimName: customClaim.name,
        };

        if (scopeType !== 'None') {
          newClaim.scope = {
            type: scopeType as ScopeType,
            value:
              scopeValue || (scopeType === ScopeType.Asset ? nextAssetId : ''),
          };
        }
      } else {
        newClaim = {
          type: selectedClaimType,
          scope: {
            type: scopeType as ScopeType,
            value:
              scopeValue || (scopeType === ScopeType.Asset ? nextAssetId : ''),
          },
        };

        if (selectedClaimType === ClaimType.Jurisdiction) {
          newClaim.code = jurisdictionValue as CountryCode;
        }
      }

      const currentClaims = conditions[conditionIndex].claims || [];

      const isDuplicate = currentClaims.some((existingClaim) => {
        return generateClaimKey(existingClaim) === generateClaimKey(newClaim);
      });

      if (isDuplicate) {
        notifyError('Claim already added');
        return;
      }

      setValue(`${baseName}.${conditionIndex}.claims`, [
        ...currentClaims,
        newClaim,
      ]);
    };

    const handleRemoveClaim = (conditionIndex: number, claimIndex: number) => {
      const condition = conditions[conditionIndex];
      const currentClaims = condition.claims || [];
      setValue(
        `${baseName}.${conditionIndex}.claims`,
        currentClaims.filter((_, idx) => idx !== claimIndex),
      );
    };

    const renderClaimChips = (conditionIndex: number) => {
      const condition = conditions[conditionIndex];
      const claims = condition?.claims || [];
      const isConditionActive =
        isActive && activeConditionIndex === conditionIndex;
      const errors = validationErrors[conditionIndex] || {};
      return (
        <>
          <FieldLabel>Selected Claims:</FieldLabel>
          <StyledClaimContainer>
            {!claims.length ? (
              <>
                <div className="no-claims">Add claims details below</div>
                {errors.claims && (
                  <StyledErrorMessage>{errors.claims}</StyledErrorMessage>
                )}
              </>
            ) : (
              claims.map((claim: FormClaim) => {
                const { mainLabel, subLabel } = formatClaimLabels(claim);
                const claimKey = generateClaimKey(claim);
                return (
                  <StyledClaim key={claimKey}>
                    <div>
                      <Text bold>{mainLabel}</Text>
                      {subLabel && <div>{subLabel}</div>}
                    </div>
                    {isConditionActive && (
                      <IconWrapper
                        onClick={() =>
                          handleRemoveClaim(
                            conditionIndex,
                            claims.findIndex(
                              (c) => generateClaimKey(c) === claimKey,
                            ),
                          )
                        }
                      >
                        <Icon name="Delete" size="20px" />
                      </IconWrapper>
                    )}
                  </StyledClaim>
                );
              })
            )}
          </StyledClaimContainer>
        </>
      );
    };

    const clearClaimsIfNeeded = useCallback(
      (conditionIndex: number, conditionType: ConditionType) => {
        const currentProcessedType =
          processedConditionTypes.current[conditionIndex];

        if (currentProcessedType !== conditionType) {
          if (CLAIM_FREE_CONDITION_TYPES.includes(conditionType)) {
            setValue(
              `${baseName}.${conditionIndex}.claims` as Path<ComplianceRuleFormData>,
              undefined,
              { shouldDirty: true },
            );
          }
          processedConditionTypes.current[conditionIndex] = conditionType;
        }
      },
      [baseName, setValue],
    );

    const handleConditionTypeChange = useCallback(
      (conditionIndex: number, conditionType: ConditionType) => {
        clearClaimsIfNeeded(conditionIndex, conditionType);
      },
      [clearClaimsIfNeeded],
    );

    useEffect(() => {
      if (!conditions) return;

      Object.keys(processedConditionTypes.current).forEach((index) => {
        if (Number(index) >= conditions.length) {
          delete processedConditionTypes.current[Number(index)];
        }
      });

      conditions.forEach((condition, index) => {
        if (condition?.type) {
          clearClaimsIfNeeded(index, condition.type as ConditionType);
        }
      });
    }, [conditions, clearClaimsIfNeeded]);

    const validateCondition = async (
      conditionIndex: number,
    ): Promise<boolean> => {
      const condition = conditions[conditionIndex];
      if (!condition || !sdk) return false;

      const errors: ValidationErrors = {};

      if (condition.type === ConditionType.IsIdentity) {
        if (condition.identity) {
          const result = await validateDid(condition.identity, sdk);
          if (!result.isValid) {
            errors.identity = result.error;
          }
        } else {
          errors.identity = VALIDATION_MESSAGES.IDENTITY_DID_REQUIRED;
        }
      } else if (!CLAIM_FREE_CONDITION_TYPES.includes(condition.type)) {
        if (!condition.claims?.length) {
          errors.claims = VALIDATION_MESSAGES.CLAIMS_REQUIRED;
        }
      }

      setValidationErrors((prev) => ({
        ...prev,
        [conditionIndex]: errors,
      }));

      return Object.keys(errors).length === 0;
    };

    React.useImperativeHandle(ref, () => ({
      validateActiveCondition: async () => {
        if (!isActive || activeConditionIndex === null) return true;
        return validateCondition(activeConditionIndex);
      },
    }));

    const handleEditCondition = async (conditionIndex: number) => {
      if (
        activeConditionIndex !== null &&
        activeConditionIndex !== conditionIndex
      ) {
        const isValid = await validateCondition(activeConditionIndex);
        if (!isValid) {
          notifyError(
            'Please fix validation errors in the current condition before editing another',
          );
          return;
        }
      }
      setActiveConditionIndex(conditionIndex);
      // Clear validation errors when editing
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[conditionIndex];
        return newErrors;
      });
    };

    const handleFinalizeCondition = async () => {
      if (activeConditionIndex === null) return;

      const isValid = await validateCondition(activeConditionIndex);
      if (!isValid) {
        notifyError(
          'Please fix validation errors before finalizing the condition',
        );
        return;
      }

      setActiveConditionIndex(null);
    };

    const handleAddNewCondition = async () => {
      // If there's an active condition, validate it first
      if (activeConditionIndex !== null) {
        const isValid = await validateCondition(activeConditionIndex);
        if (!isValid) {
          notifyError(
            'Please fix validation errors before adding a new condition',
          );
          return;
        }
      }

      const newConditionIndex = conditionFields.length;
      appendCondition(DEFAULT_NEW_CONDITION);
      setActiveConditionIndex(newConditionIndex);
    };

    return (
      <>
        {conditionFields.map((condition, condIndex) => {
          const isConditionActive =
            isActive && activeConditionIndex === condIndex;
          const errors = validationErrors[condIndex] || {};
          const currentCondition = conditions[condIndex];

          return (
            <ConditionAccordion
              key={condition.id}
              $isExpanded={isConditionActive}
            >
              <ConditionHeader
                $isExpanded={isConditionActive}
                $isClickable={isActive && !isConditionActive}
                onClick={() =>
                  !isConditionActive &&
                  isActive &&
                  handleEditCondition(condIndex)
                }
              >
                <div style={{ flex: 1 }}>
                  <FieldLabel>Condition #{condIndex + 1}</FieldLabel>
                  {!isConditionActive && currentCondition && (
                    <ConditionSummary>
                      <ConditionSummaryText
                        condition={currentCondition}
                        claimNames={claimNames}
                      />
                    </ConditionSummary>
                  )}
                </div>
                {isActive && conditionFields.length > 1 && (
                  <IconWrapper
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCondition(condIndex);
                      setValidationErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors[condIndex];
                        return newErrors;
                      });
                      if (activeConditionIndex === condIndex) {
                        setActiveConditionIndex(null);
                      } else if (
                        activeConditionIndex !== null &&
                        activeConditionIndex > condIndex
                      ) {
                        setActiveConditionIndex(activeConditionIndex - 1);
                      }
                    }}
                  >
                    <Icon name="Delete" size="20px" />
                  </IconWrapper>
                )}
              </ConditionHeader>

              <ConditionContent $isExpanded={isConditionActive}>
                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel>Applies to</FieldLabel>
                    <FieldSelect
                      {...control.register(`${baseName}.${condIndex}.target`)}
                    >
                      {targetOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </FieldSelect>
                  </FieldRow>
                </FieldWrapper>

                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel>Condition Type</FieldLabel>
                    <FieldSelect
                      {...control.register(`${baseName}.${condIndex}.type`, {
                        onChange: (e) =>
                          handleConditionTypeChange(
                            condIndex,
                            e.target.value as ConditionType,
                          ),
                      })}
                    >
                      {conditionTypes.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </FieldSelect>
                  </FieldRow>
                </FieldWrapper>

                {conditions?.[condIndex]?.type === ConditionType.IsIdentity && (
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel>Identity DID</FieldLabel>
                      <FieldInput
                        placeholder="Enter identity DID"
                        {...control.register(
                          `${baseName}.${condIndex}.identity`,
                        )}
                        value={conditions?.[condIndex]?.identity || ''}
                        $hasError={!!errors.identity}
                      />
                    </FieldRow>
                    {errors.identity && (
                      <StyledErrorMessage>{errors.identity}</StyledErrorMessage>
                    )}
                  </FieldWrapper>
                )}

                {[
                  ConditionType.IsAnyOf,
                  ConditionType.IsPresent,
                  ConditionType.IsNoneOf,
                ].includes(conditions?.[condIndex]?.type as ConditionType) && (
                  <>
                    {renderClaimChips(condIndex)}
                    <ClaimTypeSelector
                      onAddClaim={(data) => handleAddClaim(condIndex, data)}
                      nextAssetId={nextAssetId}
                    />
                  </>
                )}

                <Button type="button" onClick={handleFinalizeCondition}>
                  Done Editing
                </Button>
              </ConditionContent>
            </ConditionAccordion>
          );
        })}

        {isActive && (
          <Button type="button" onClick={handleAddNewCondition}>
            Add Condition
          </Button>
        )}
      </>
    );
  },
);

ComplianceRule.displayName = 'ComplianceRule';

export default ComplianceRule;
