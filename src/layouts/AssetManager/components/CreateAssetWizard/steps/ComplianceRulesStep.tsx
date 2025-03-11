/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  ConditionTarget,
  ConditionType,
  ClaimType,
  InputCondition,
  SetAssetRequirementsParams,
  Claim,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  FormContainer,
  DescriptionText,
  NavigationWrapper,
  IconWrapper,
  HeaderRow,
  FieldLabel,
  StyledForm,
  StyledFormSection,
  Button,
} from '../styles';
import { Icon } from '~/components';
import ComplianceRule from '../components/ComplianceRule';
import {
  WizardStepProps,
  FormCondition,
  FormClaim,
  FormComplianceRule,
  ComplianceRuleFormData,
} from '../types';
import StepNavigation from '../components/StepNavigation';

const convertFormClaimToSdk = (formClaim: FormClaim): Claim => {
  const base = {
    type: formClaim.type,
    ...(formClaim.scope && { scope: formClaim.scope }),
  };

  if (formClaim.type === ClaimType.Jurisdiction && formClaim.code) {
    return {
      ...base,
      type: ClaimType.Jurisdiction,
      code: formClaim.code,
    } as Claim;
  }

  if (formClaim.type === ClaimType.Custom && formClaim.customClaimTypeId) {
    return {
      ...base,
      type: ClaimType.Custom,
      customClaimTypeId: formClaim.customClaimTypeId,
    } as Claim;
  }

  return base as Claim;
};

const convertFormRulesToSdk = (
  formData: FormComplianceRule[],
): InputCondition[][] => {
  return formData.map((rule) => {
    const inputConditions: InputCondition[] = [];

    rule.conditions.forEach((condition) => {
      switch (condition.type) {
        case ConditionType.IsPresent:
        case ConditionType.IsAbsent: {
          condition.claims?.forEach((claim) => {
            const singleCondition = {
              type:
                condition.type === ConditionType.IsPresent
                  ? ConditionType.IsPresent
                  : ConditionType.IsAbsent,
              target: condition.target,
              claim: convertFormClaimToSdk(claim),
              trustedClaimIssuers: condition.trustedClaimIssuers || [],
            } satisfies InputCondition;
            inputConditions.push(singleCondition);
          });
          break;
        }

        case ConditionType.IsAnyOf:
        case ConditionType.IsNoneOf:
          inputConditions.push({
            type: condition.type,
            target: condition.target,
            claims: condition.claims
              ? condition.claims.map(convertFormClaimToSdk)
              : [],
            trustedClaimIssuers: condition.trustedClaimIssuers || [],
          } satisfies InputCondition);
          break;

        case ConditionType.IsIdentity: {
          if (!condition.identity) {
            throw new Error('Identity condition requires an identity');
          }
          inputConditions.push({
            type: condition.type,
            target: condition.target,
            identity: condition.identity,
          } satisfies InputCondition);
          break;
        }

        case ConditionType.IsExternalAgent: {
          inputConditions.push({
            type: condition.type,
            target: condition.target,
          } satisfies InputCondition);
          break;
        }

        default:
          throw new Error('Invalid condition type');
      }
    });
    return inputConditions;
  });
};

const convertSdkToFormFormat = (
  sdkRules: SetAssetRequirementsParams,
): FormComplianceRule[] => {
  const { requirements } = sdkRules;
  const formRules: FormComplianceRule[] = requirements.map(
    (rule: InputCondition[]) => {
      // Group conditions by type, target and trusted claim issuers
      const groupedConditions = rule.reduce<{
        [key: string]: FormCondition;
      }>((acc, condition, index) => {
        if (
          condition.type === ConditionType.IsPresent ||
          condition.type === ConditionType.IsAbsent
        ) {
          // Create a key using the target and trusted claim issuers to group by
          const key = `${condition.type}-${condition.target}-${JSON.stringify(condition.trustedClaimIssuers || [])}`;
          if (!acc[key]) {
            acc[key] = {
              type:
                condition.type === ConditionType.IsPresent
                  ? ConditionType.IsPresent
                  : ConditionType.IsNoneOf,
              target: condition.target,
              claims: [],
              ...(condition.trustedClaimIssuers && {
                trustedClaimIssuers: condition.trustedClaimIssuers,
              }),
            };
          }
          if (condition.claim) {
            acc[key].claims?.push(condition.claim);
          }
          return acc;
        }

        switch (condition.type) {
          case ConditionType.IsAnyOf:
          case ConditionType.IsNoneOf:
            return {
              ...acc,
              [index]: {
                type: condition.type,
                target: condition.target,
                claims: condition.claims || [],
                ...(condition.trustedClaimIssuers && {
                  trustedClaimIssuers: condition.trustedClaimIssuers,
                }),
              },
            };

          case ConditionType.IsIdentity:
            return {
              ...acc,
              [index]: {
                type: condition.type,
                target: condition.target,
                identity: condition.identity.toString() || '',
              },
            };

          case ConditionType.IsExternalAgent:
            return {
              ...acc,
              [index]: {
                type: condition.type,
                target: condition.target,
              },
            };

          default:
            return acc;
        }
      }, {});

      return {
        conditions: Object.values(groupedConditions),
      };
    },
  );
  return formRules;
};

const ComplianceRulesStep: React.FC<WizardStepProps> = ({
  onBack,
  onComplete,
  nextAssetId,
  defaultValues,
  isFinalStep,
  isLoading,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ComplianceRuleFormData>({
    defaultValues: {
      complianceRules: convertSdkToFormFormat(defaultValues.complianceRules),
    },
  });

  const {
    fields: ruleFields,
    append: appendRule,
    remove: removeRule,
  } = useFieldArray({
    control,
    name: 'complianceRules',
  });

  const handleFormSubmit = (data: ComplianceRuleFormData) => {
    const sdkRules = data.complianceRules.length
      ? convertFormRulesToSdk(data.complianceRules)
      : [];
    onComplete({
      ...defaultValues,
      complianceRules: { requirements: sdkRules },
    });
  };

  return (
    <FormContainer>
      <h2>Compliance Rules</h2>
      <DescriptionText>
        Define on-chain compliance rules that are automatically enforced. At
        least one rule must be fully met for an asset transfer to proceed. Each
        rule's conditions must all be satisfied for the rule to be considered
        met.
      </DescriptionText>

      <StyledForm onSubmit={handleSubmit(handleFormSubmit)}>
        {ruleFields.map((rule, ruleIndex) => (
          <StyledFormSection key={rule.id}>
            <HeaderRow>
              <FieldLabel>Rule #{ruleIndex + 1}</FieldLabel>
              <IconWrapper onClick={() => removeRule(ruleIndex)}>
                <Icon name="Delete" size="20px" />
              </IconWrapper>
            </HeaderRow>

            <ComplianceRule
              control={control}
              setValue={setValue}
              baseName={`complianceRules.${ruleIndex}.conditions`}
              nextAssetId={nextAssetId}
            />
          </StyledFormSection>
        ))}

        <Button
          type="button"
          onClick={() =>
            appendRule({
              conditions: [
                {
                  type: ConditionType.IsPresent,
                  target: ConditionTarget.Both,
                  claims: [],
                },
              ],
            })
          }
        >
          Add Rule
        </Button>
      </StyledForm>

      <NavigationWrapper>
        <StepNavigation
          onBack={onBack}
          onNext={handleSubmit(handleFormSubmit)}
          isFinalStep={isFinalStep}
          disabled={Object.keys(errors).length > 0}
          isLoading={isLoading}
        />
      </NavigationWrapper>
    </FormContainer>
  );
};

export default ComplianceRulesStep;
