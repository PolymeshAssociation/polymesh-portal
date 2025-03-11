/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  Control,
  useFieldArray,
  UseFormSetValue,
  useWatch,
  Path,
} from 'react-hook-form';
import {
  ClaimType,
  ConditionTarget,
  ConditionType,
  CountryCode,
  ScopeType,
} from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  Button,
  FieldLabel,
  FieldRow,
  FieldWrapper,
  FieldSelect,
  FieldInput,
  IconWrapper,
  HeaderRow,
  StyledClaimContainer,
  StyledClaim,
  TrustedClaimTypesContainer,
} from '../styles';
import { Icon, CopyToClipboard } from '~/components';
import { Text } from '~/components/UiKit';

import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { splitCamelCase, formatDid } from '~/helpers/formatters';
import { ComplianceRuleFormData, FormCondition, FormClaim } from '../types';
import { useCustomClaims, CustomClaim } from '~/hooks/polymesh/useCustomClaims';
import CreateCustomClaimModal from './CreateCustomClaimModal';

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

type ExtendedScopeType = ScopeType | 'None';

interface ComplianceRuleProps {
  control: Control<ComplianceRuleFormData>;
  setValue: UseFormSetValue<ComplianceRuleFormData>;
  baseName: `complianceRules.${number}.conditions`;
  nextAssetId: string;
}

const ComplianceRule: React.FC<ComplianceRuleProps> = ({
  control,
  setValue,
  baseName,
  nextAssetId,
}) => {
  const [selectedClaimType, setSelectedClaimType] = useState<ClaimType | ''>(
    '',
  );
  const [scopeType, setScopeType] = useState<ExtendedScopeType>(
    ScopeType.Asset,
  );
  const [scopeValue, setScopeValue] = useState<string>('');
  const [jurisdictionValue, setJurisdictionValue] = useState<string>('');
  const [customClaim, setCustomClaim] = useState<{
    id: BigNumber;
    name: string;
  } | null>(null);

  // Add ref to track processed condition types
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

  const {
    validateCustomClaim,
    createModalState,
    handleCreateModalClose,
    handleCreateModalOpen,
    handleCustomClaimCreated,
    getClaimName,
    claimNames,
  } = useCustomClaims();

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

  const handleClaimTypeChange = (type: ClaimType) => {
    setSelectedClaimType(type);
  };

  const handleScopeTypeChange = (newType: ExtendedScopeType) => {
    setScopeType(newType);
    setScopeValue('');
  };

  const addClaimToCondition = (conditionIndex: number, claim: CustomClaim) => {
    const newClaim: FormClaim = {
      type: ClaimType.Custom,
      customClaimTypeId: claim.id,
      customClaimName: claim.name,
    };

    if (scopeType !== 'None') {
      newClaim.scope = {
        type: scopeType as ScopeType,
        value: scopeValue || '',
      };
    }

    const currentClaims = conditions[conditionIndex].claims || [];
    setValue(`${baseName}.${conditionIndex}.claims`, [
      ...currentClaims,
      newClaim,
    ]);

    // Reset input fields after successful addition
    setSelectedClaimType('');
    setCustomClaim(null);
    if (scopeType === 'None') {
      setScopeType(ScopeType.Asset);
    }
  };

  const handleAddClaim = async (conditionIndex: number) => {
    if (!selectedClaimType) return;

    // For custom claims, validate and potentially create
    if (selectedClaimType === ClaimType.Custom && customClaim) {
      const validClaim = await validateCustomClaim(customClaim.name);
      if (!validClaim) {
        // If it's a number ID that doesn't exist, error was already shown
        if (!Number.isNaN(Number(customClaim.name))) {
          return;
        }
        // Otherwise, show creation modal
        handleCreateModalOpen(customClaim.name, (newClaim) => {
          setCustomClaim(newClaim);
          addClaimToCondition(conditionIndex, newClaim);
        });
        return;
      }
      addClaimToCondition(conditionIndex, validClaim);
      return;
    }

    // Handle non-custom claims as before
    const newClaim: FormClaim = {
      type: selectedClaimType,
    };

    if (selectedClaimType !== ClaimType.Custom || scopeType !== 'None') {
      newClaim.scope = {
        type: scopeType as ScopeType,
        value: (() => {
          if (scopeValue) {
            return scopeValue;
          }
          if (scopeType === ScopeType.Asset) {
            return nextAssetId;
          }
          return '';
        })(),
      };
    }

    if (selectedClaimType === ClaimType.Jurisdiction && jurisdictionValue) {
      newClaim.code = jurisdictionValue as CountryCode;
    }

    const currentClaims = conditions[conditionIndex].claims || [];
    setValue(`${baseName}.${conditionIndex}.claims`, [
      ...currentClaims,
      newClaim,
    ]);

    // Reset input fields after successful addition
    setSelectedClaimType('');
    setJurisdictionValue('');
    setCustomClaim(null);
  };

  const handleRemoveClaim = (conditionIndex: number, claimIndex: number) => {
    const condition = conditions[conditionIndex];
    const currentClaims = condition.claims || [];
    setValue(
      `${baseName}.${conditionIndex}.claims`,
      currentClaims.filter((_: FormClaim, idx: number) => idx !== claimIndex),
    );
  };

  const renderClaimChips = (conditionIndex: number) => {
    const condition = conditions[conditionIndex];

    return (
      <>
        <FieldLabel>Selected Claims:</FieldLabel>
        <StyledClaimContainer>
          {!condition?.claims?.length ? (
            <div className="no-claims">Add claims details below</div>
          ) : (
            condition.claims.map((claim: FormClaim, idx: number) => {
              let mainLabel = '';
              let subLabel: React.ReactNode = '';

              if (claim.type === ClaimType.Jurisdiction && claim.code) {
                const country = countryCodes.find((c) => c.code === claim.code);
                mainLabel = `${splitCamelCase(claim.type)} - ${country?.name || claim.code}`;
              } else if (
                claim.type === ClaimType.Custom &&
                claim.customClaimTypeId
              ) {
                const claimId = claim.customClaimTypeId.toString();
                const claimName =
                  claim.customClaimName || claimNames[claimId] || 'Unknown';
                mainLabel = `Custom - ID ${claimId}, ${claimName}`;
              } else {
                mainLabel = `${splitCamelCase(claim.type)}`;
              }

              if (claim.scope) {
                const value =
                  claim.scope.type === ScopeType.Identity
                    ? formatDid(claim.scope.value, 8, 8)
                    : claim.scope.value;
                const showCopy =
                  claim.scope.type === ScopeType.Identity ||
                  claim.scope.type === ScopeType.Asset;
                subLabel = (
                  <>
                    Scope: {claim.scope.type} -{' '}
                    <span
                      style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                      {value}
                      {showCopy && (
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

              return (
                // eslint-disable-next-line react/no-array-index-key
                <StyledClaim key={`${claim.type}-${idx}`}>
                  <div>
                    <Text bold>{mainLabel}</Text>
                    {subLabel && <div>{subLabel}</div>}
                  </div>
                  <IconWrapper
                    onClick={() => handleRemoveClaim(conditionIndex, idx)}
                  >
                    <Icon name="Delete" size="20px" />
                  </IconWrapper>
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
        if (
          [ConditionType.IsIdentity, ConditionType.IsExternalAgent].includes(
            conditionType,
          )
        ) {
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
    (conditionIndex: number, newType: ConditionType) => {
      clearClaimsIfNeeded(conditionIndex, newType);
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

  const handleCustomClaimInputChange = (value: string) => {
    setCustomClaim({ id: new BigNumber(0), name: value });
  };

  return (
    <>
      {conditionFields.map((condition, condIndex) => (
        <div key={condition.id}>
          <HeaderRow>
            <FieldLabel>Condition #{condIndex + 1}</FieldLabel>
            <IconWrapper onClick={() => removeCondition(condIndex)}>
              <Icon name="Delete" size="20px" />
            </IconWrapper>
          </HeaderRow>

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
                  {...control.register(`${baseName}.${condIndex}.identity`)}
                />
              </FieldRow>
            </FieldWrapper>
          )}

          {[
            ConditionType.IsAnyOf,
            ConditionType.IsPresent,
            ConditionType.IsNoneOf,
          ].includes(conditions?.[condIndex]?.type as ConditionType) && (
            <>
              {renderClaimChips(condIndex)}
              <FieldWrapper>
                <TrustedClaimTypesContainer>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel>Claim Type</FieldLabel>
                      <FieldSelect
                        value={selectedClaimType}
                        onChange={(e) =>
                          handleClaimTypeChange(e.target.value as ClaimType)
                        }
                      >
                        <option value="">Select a claim type</option>
                        {Object.values(ClaimType)
                          .filter(
                            (claim) => claim !== ClaimType.CustomerDueDiligence,
                          )
                          .map((claim) => (
                            <option key={claim} value={claim}>
                              {splitCamelCase(claim)}
                            </option>
                          ))}
                      </FieldSelect>
                    </FieldRow>
                  </FieldWrapper>

                  {selectedClaimType === ClaimType.Jurisdiction && (
                    <FieldWrapper>
                      <FieldRow>
                        <FieldLabel>Jurisdiction</FieldLabel>
                        <FieldSelect
                          value={jurisdictionValue}
                          onChange={(e) => setJurisdictionValue(e.target.value)}
                        >
                          <option value="">Select a jurisdiction</option>
                          {countryCodes.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </FieldSelect>
                      </FieldRow>
                    </FieldWrapper>
                  )}

                  {selectedClaimType === ClaimType.Custom && (
                    <FieldWrapper>
                      <FieldRow>
                        <FieldLabel>Custom Claim</FieldLabel>
                        <FieldInput
                          placeholder="Enter claim ID or name"
                          value={customClaim?.name || ''}
                          onChange={(e) =>
                            handleCustomClaimInputChange(e.target.value)
                          }
                        />
                      </FieldRow>
                    </FieldWrapper>
                  )}

                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel>Scope Type</FieldLabel>
                      <FieldSelect
                        value={scopeType}
                        onChange={(e) =>
                          handleScopeTypeChange(
                            e.target.value as ExtendedScopeType,
                          )
                        }
                      >
                        {selectedClaimType === ClaimType.Custom && (
                          <option value="None">No Scope</option>
                        )}
                        {Object.values(ScopeType).map((scope) => (
                          <option key={scope} value={scope}>
                            {scope}
                          </option>
                        ))}
                      </FieldSelect>
                    </FieldRow>
                  </FieldWrapper>

                  {scopeType !== 'None' && (
                    <FieldWrapper>
                      <FieldRow>
                        <FieldLabel>Scope Value</FieldLabel>
                        <FieldInput
                          placeholder={
                            scopeType === ScopeType.Asset
                              ? nextAssetId
                              : 'Enter scope value'
                          }
                          value={scopeValue}
                          onChange={(e) => setScopeValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FieldRow>
                    </FieldWrapper>
                  )}

                  <Button
                    type="button"
                    onClick={() => handleAddClaim(condIndex)}
                    disabled={
                      !selectedClaimType ||
                      (selectedClaimType === ClaimType.Custom &&
                        (!customClaim || !customClaim.name)) ||
                      (selectedClaimType === ClaimType.Jurisdiction &&
                        !jurisdictionValue) ||
                      (scopeType !== 'None' &&
                        scopeType !== ScopeType.Asset &&
                        !scopeValue)
                    }
                  >
                    Add Claim
                  </Button>
                </TrustedClaimTypesContainer>
              </FieldWrapper>
            </>
          )}
        </div>
      ))}

      <Button
        type="button"
        onClick={() =>
          appendCondition({
            type: ConditionType.IsPresent,
            target: ConditionTarget.Both,
            claims: [],
          } as FormCondition)
        }
      >
        Add Condition
      </Button>

      {createModalState.isOpen && (
        <CreateCustomClaimModal
          customClaimName={createModalState.pendingName}
          onClose={handleCreateModalClose}
          onSuccess={handleCustomClaimCreated}
        />
      )}
    </>
  );
};

export default ComplianceRule;
