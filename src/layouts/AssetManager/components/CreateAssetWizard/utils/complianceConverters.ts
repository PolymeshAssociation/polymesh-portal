import {
  ConditionType,
  ClaimType,
  InputCondition,
  SetAssetRequirementsParams,
  Claim,
} from '@polymeshassociation/polymesh-sdk/types';
import { FormCondition, FormClaim, FormComplianceRule } from '../types';

export const convertFormClaimToSdk = (formClaim: FormClaim): Claim => {
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

export const convertFormRulesToSdk = (
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
          throw new Error(`Unsupported condition type: ${condition.type}`);
      }
    });

    return inputConditions;
  });
};

export const convertSdkToFormFormat = (
  sdkRules: SetAssetRequirementsParams,
): FormComplianceRule[] => {
  const { requirements } = sdkRules;
  const formRules = requirements.map((rule: InputCondition[]) => {
    // Group conditions by their type, target, and trusted claim issuers for consolidation
    const groupedConditions = rule.reduce<{
      [key: string]: FormCondition;
    }>((acc, condition, index) => {
      if (
        condition.type === ConditionType.IsPresent ||
        condition.type === ConditionType.IsAbsent
      ) {
        // For IsPresent/IsAbsent, group by target and trusted claim issuers
        const key = `${condition.type}-${condition.target}-${JSON.stringify(
          condition.trustedClaimIssuers || [],
        )}`;
        if (!acc[key]) {
          acc[key] = {
            type:
              condition.type === ConditionType.IsPresent
                ? ConditionType.IsPresent
                : ConditionType.IsNoneOf, // Use IsNoneOf for absent conditions
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

      // Handle other condition types individually
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
              identity: condition.identity?.toString() || '',
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
  });
  return formRules;
};
