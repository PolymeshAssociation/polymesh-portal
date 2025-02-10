/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect } from 'react';
import {
  Control,
  Controller,
  useFieldArray,
  useWatch,
  UseFormSetValue,
} from 'react-hook-form';
import {
  ConditionTarget,
  ConditionType,
  ClaimType,
  SingleClaimCondition,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  FieldLabel,
  FieldSelect,
  FieldInput,
  Button,
  IconWrapper,
  HeaderRow,
  StyledFormSection,
  FieldWrapper,
  FieldRow,
  StyledErrorMessage,
  StyledConditionSection,
} from '../styles';
import { Icon } from '~/components';

interface ComplianceCondition {
  type: ConditionType;
  target: ConditionTarget;
  conditionType: ConditionType;
  claimType?: ClaimType | ClaimType[];
  identity?: string;
  scope?: 'Asset' | 'Identity' | 'Custom';
  scopeDetails?: string;
  countryCode?: string;
  customClaimId?: string;
  trustedClaimIssuers?: string[];
}

interface RuleProps {
  control: Control<any> & { setValue: UseFormSetValue<any> };
  baseName: string;
  nextAssetId: string;
}

const conditionTypeOptions = [
  { value: ConditionType.IsExternalAgent, label: 'Is External Agent' },
  { value: ConditionType.IsPresent, label: 'Is Present' },
  { value: ConditionType.IsAbsent, label: 'Is Absent' },
  { value: ConditionType.IsAnyOf, label: 'Is Any Of' },
  { value: ConditionType.IsNoneOf, label: 'Is None Of' },
  { value: ConditionType.IsIdentity, label: 'Is Identity' },
] as const;

const targetOptions = [
  { value: ConditionTarget.Both, label: 'Sender and Receiver' },
  { value: ConditionTarget.Sender, label: 'Sender' },
  { value: ConditionTarget.Receiver, label: 'Receiver' },
] as const;

const claimTypeOptions = Object.values(ClaimType)
  .filter((type) => type !== ClaimType.CustomerDueDiligence)
  .map((type) => ({
    value: type,
    label: type,
  }));

const getScopeLabel = (scope: string): string => {
  switch (scope) {
    case 'Asset':
      return 'Asset ID';
    case 'Identity':
      return 'Identity';
    case 'Custom':
      return 'Custom Scope';
    default:
      return 'Scope Details';
  }
};

const getScopePlaceholder = (scope: string): string => {
  switch (scope) {
    case 'Asset':
      return 'Asset ID';
    case 'Identity':
      return 'Identity';
    case 'Custom':
      return 'custom scope';
    default:
      return 'scope details';
  }
};

const ComplianceRule: React.FC<RuleProps> = ({
  control,
  baseName,
  nextAssetId,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: baseName,
  });

  const { setValue } = control;

  const conditions = useWatch({
    control,
    name: baseName,
  }) as ComplianceCondition[];

  useEffect(() => {
    if (!conditions || !setValue) return;

    conditions.forEach((condition, index) => {
      const isNoScopeType =
        condition.conditionType === ConditionType.IsExternalAgent ||
        condition.conditionType === ConditionType.IsIdentity;

      if (isNoScopeType) {
        // Clear scope and scopeDetails immediately
        setValue(`${baseName}.${index}.scope`, undefined, {
          shouldValidate: true,
        });
        setValue(`${baseName}.${index}.scopeDetails`, undefined, {
          shouldValidate: true,
        });
        setValue(`${baseName}.${index}.claimType`, undefined, {
          shouldValidate: true,
        });
      }
    });
  }, [conditions, setValue, baseName]);

  return (
    <>
      {fields.map((field, condIndex) => {
        const condition =
          conditions?.[condIndex] || ({} as ComplianceCondition);
        const condType = condition.conditionType;
        const claimTypeValue = condition.claimType;
        const currentScope = condition.scope || '';

        let conditionInputs = null;
        if (
          condType !== ConditionType.IsExternalAgent &&
          condType !== ConditionType.IsIdentity
        ) {
          conditionInputs = (
            <>
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Claim Types</FieldLabel>
                  <Controller
                    control={control}
                    name={`${baseName}.${condIndex}.claimType` as const}
                    render={({ field: innerField, fieldState: { error } }) => (
                      <>
                        <FieldSelect
                          multiple
                          value={
                            Array.isArray(innerField.value)
                              ? innerField.value
                              : []
                          }
                          onChange={(e) => {
                            const selectedValues = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value,
                            ) as ClaimType[];
                            innerField.onChange(selectedValues);
                          }}
                          $hasError={!!error}
                        >
                          {claimTypeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </FieldSelect>
                        {error && (
                          <StyledErrorMessage>
                            {error.message}
                          </StyledErrorMessage>
                        )}
                      </>
                    )}
                  />
                </FieldRow>
              </FieldWrapper>

              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Scope</FieldLabel>
                  <Controller
                    control={control}
                    name={`${baseName}.${condIndex}.scope` as const}
                    render={({ field: innerField, fieldState: { error } }) => (
                      <>
                        <FieldSelect
                          value={innerField.value || ''}
                          onChange={(e) => innerField.onChange(e.target.value)}
                          $hasError={!!error}
                        >
                          <option value="Asset">Asset</option>
                          <option value="Identity">Identity</option>
                          <option value="Custom">Custom</option>
                        </FieldSelect>
                        {error && (
                          <StyledErrorMessage>
                            {error.message}
                          </StyledErrorMessage>
                        )}
                      </>
                    )}
                  />
                </FieldRow>
              </FieldWrapper>

              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>{getScopeLabel(currentScope)}</FieldLabel>
                  <Controller
                    control={control}
                    name={`${baseName}.${condIndex}.scopeDetails` as const}
                    render={({ field: innerField, fieldState: { error } }) => (
                      <>
                        <FieldInput
                          type="text"
                          placeholder={`Enter ${getScopePlaceholder(currentScope || 'Asset')}`}
                          value={innerField.value || ''}
                          onChange={(e) => innerField.onChange(e.target.value)}
                          $hasError={!!error}
                        />
                        {error && (
                          <StyledErrorMessage>
                            {error.message}
                          </StyledErrorMessage>
                        )}
                      </>
                    )}
                  />
                </FieldRow>
              </FieldWrapper>
            </>
          );
        } else if (condType === ConditionType.IsIdentity) {
          conditionInputs = (
            <FieldWrapper>
              <FieldRow>
                <FieldLabel>Identity DID</FieldLabel>
                <Controller
                  control={control}
                  name={`${baseName}.${condIndex}.identity` as const}
                  render={({ field: innerField, fieldState: { error } }) => (
                    <>
                      <FieldInput
                        placeholder="Enter identity DID"
                        type="text"
                        value={innerField.value || ''}
                        onChange={(e) => innerField.onChange(e.target.value)}
                        $hasError={!!error}
                      />
                      {error && (
                        <StyledErrorMessage>{error.message}</StyledErrorMessage>
                      )}
                    </>
                  )}
                />
              </FieldRow>
            </FieldWrapper>
          );
        }

        return (
          <StyledConditionSection key={field.id}>
            <HeaderRow>
              <FieldLabel>Condition #{condIndex + 1}</FieldLabel>
              <IconWrapper onClick={() => remove(condIndex)}>
                <Icon name="Delete" size="20px" />
              </IconWrapper>
            </HeaderRow>

            <FieldWrapper>
              <FieldRow>
                <FieldLabel>Applies To</FieldLabel>
                <Controller
                  control={control}
                  name={`${baseName}.${condIndex}.target` as const}
                  render={({ field: innerField, fieldState: { error } }) => (
                    <>
                      <FieldSelect
                        value={innerField.value || ''}
                        onChange={(e) =>
                          innerField.onChange(e.target.value as ConditionTarget)
                        }
                        $hasError={!!error}
                      >
                        {targetOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </FieldSelect>
                      {error && (
                        <StyledErrorMessage>{error.message}</StyledErrorMessage>
                      )}
                    </>
                  )}
                />
              </FieldRow>
            </FieldWrapper>

            <FieldWrapper>
              <FieldRow>
                <FieldLabel>Condition Type</FieldLabel>
                <Controller
                  control={control}
                  name={`${baseName}.${condIndex}.conditionType` as const}
                  render={({ field: innerField, fieldState: { error } }) => (
                    <>
                      <FieldSelect
                        value={innerField.value || ''}
                        onChange={(e) =>
                          innerField.onChange(e.target.value as ConditionType)
                        }
                        $hasError={!!error}
                      >
                        {conditionTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </FieldSelect>
                      {error && (
                        <StyledErrorMessage>{error.message}</StyledErrorMessage>
                      )}
                    </>
                  )}
                />
              </FieldRow>
            </FieldWrapper>

            {conditionInputs}

            {((Array.isArray(claimTypeValue) &&
              claimTypeValue.includes(ClaimType.Jurisdiction)) ||
              claimTypeValue === ClaimType.Jurisdiction) && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Country Code</FieldLabel>
                  <Controller
                    control={control}
                    name={`${baseName}.${condIndex}.countryCode` as const}
                    render={({ field: innerField, fieldState: { error } }) => (
                      <>
                        <FieldInput
                          type="text"
                          placeholder="e.g. US"
                          value={innerField.value || ''}
                          onChange={(e) => innerField.onChange(e.target.value)}
                          $hasError={!!error}
                        />
                        {error && (
                          <StyledErrorMessage>
                            {error.message}
                          </StyledErrorMessage>
                        )}
                      </>
                    )}
                  />
                </FieldRow>
              </FieldWrapper>
            )}

            {((Array.isArray(claimTypeValue) &&
              claimTypeValue.includes(ClaimType.Custom)) ||
              claimTypeValue === ClaimType.Custom) && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Custom Claim ID</FieldLabel>
                  <Controller
                    control={control}
                    name={`${baseName}.${condIndex}.customClaimId` as const}
                    render={({ field: innerField, fieldState: { error } }) => (
                      <>
                        <FieldInput
                          type="text"
                          placeholder="Enter custom claim ID"
                          value={innerField.value || ''}
                          onChange={(e) => innerField.onChange(e.target.value)}
                          $hasError={!!error}
                        />
                        {error && (
                          <StyledErrorMessage>
                            {error.message}
                          </StyledErrorMessage>
                        )}
                      </>
                    )}
                  />
                </FieldRow>
              </FieldWrapper>
            )}
          </StyledConditionSection>
        );
      })}

      <Button
        type="button"
        onClick={() =>
          append({
            type: ConditionType.IsExternalAgent,
            target: ConditionTarget.Both,
            conditionType: ConditionType.IsExternalAgent,
          } as ComplianceCondition)
        }
      >
        Add Condition
      </Button>
    </>
  );
};

export default ComplianceRule;
