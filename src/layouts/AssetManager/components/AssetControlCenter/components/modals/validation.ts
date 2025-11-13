import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  ClaimType,
  CountryCode,
  StatType,
  TransferRestriction,
  TransferRestrictionStatValues,
} from '@polymeshassociation/polymesh-sdk/types';
import * as yup from 'yup';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { formatDid } from '~/helpers/formatters';
import type { IAddTrackedStatForm } from './AddTrackedStatModal';

const isValidCount = (value: unknown): boolean => {
  if (!value) return true;
  const num = Number(value);
  return !Number.isNaN(num) && Number.isInteger(num) && num >= 0;
};

export const countValidation = yup
  .string()
  .nullable()
  .test('is-valid-count', 'Must be a whole number if provided', isValidCount);

export const balanceValidation = yup
  .string()
  .nullable()
  .test(
    'is-valid-balance',
    'Must be a valid number with up to 6 decimal places if provided',
    (value) => {
      if (!value) return true;
      const num = Number(value);
      if (Number.isNaN(num) || num < 0) return false;
      const decimalPart = value.split('.')[1];
      return !decimalPart || decimalPart.length <= 6;
    },
  );

export const requiredCountValidation = countValidation
  .required('This field is required')
  .test('is-valid-count', 'Must be a whole number', (value) => {
    if (!value) return false;
    return isValidCount(value);
  });

export const requiredBalanceValidation = balanceValidation
  .required('This field is required')
  .test(
    'is-valid-balance',
    'Must be a valid number with up to 6 decimal places',
    (value) => {
      if (!value) return false;
      const num = Number(value);
      if (Number.isNaN(num) || num < 0) return false;
      const decimalPart = value.split('.')[1];
      return !decimalPart || decimalPart.length <= 6;
    },
  );

export const createAddStatValidationSchema = (
  sdk: Polymesh | null,
  existingStats?: TransferRestrictionStatValues[],
) => {
  const baseSchema = {
    type: yup
      .string()
      .required('Stat type is required')
      .test('not-empty', 'Please select a stat type', (value) => value !== ''),
    count: yup.string().when('type', {
      is: StatType.Count,
      then: () => countValidation,
      otherwise: (schema) => schema.nullable(),
    }),
    balance: yup.string().when('type', {
      is: StatType.Balance,
      then: () => balanceValidation,
      otherwise: (schema) => schema.nullable(),
    }),
  };

  const scopedSchema = {
    claimType: yup.string().when('type', {
      is: (val: string) =>
        val === StatType.ScopedCount || val === StatType.ScopedBalance,
      then: (schema) =>
        schema
          .required('Claim type is required')
          .test(
            'not-empty',
            'Please select a claim type',
            (value) => value !== '',
          ),
      otherwise: (schema) => schema.nullable(),
    }),
    issuer: yup.string().when(['type', 'claimType'], {
      is: (type: string, claimType: string) =>
        (type === StatType.ScopedCount || type === StatType.ScopedBalance) &&
        claimType,
      then: (schema) =>
        schema
          .required('Claim issuer DID is required')
          .matches(/^0x[0-9a-fA-F]{64}$/, 'Must be a valid DID')
          .test(
            'is-valid-identity',
            'DID does not exist',
            async function validateIssuerDid(value) {
              if (!value || !value.match(/^0x[0-9a-fA-F]{64}$/)) return true;
              if (!sdk) return false;
              try {
                return await sdk.identities.isIdentityValid({
                  identity: value,
                });
              } catch (error) {
                return false;
              }
            },
          )
          .test(
            'is-unique-combination',
            'This combination of stat type, claim, and issuer already exists',
            function validateUniqueCombination(value) {
              if (!value || !existingStats) return true;
              const { type, claimType } = this.parent;
              if (!type || !claimType) return true;

              const duplicate = existingStats.find((stat) => {
                if (stat.type !== type) return false;
                if (!stat.claim) return false;
                if (stat.claim.claimType !== claimType) return false;
                return stat.claim.issuer.did === value;
              });

              return !duplicate;
            },
          ),
      otherwise: (schema) => schema.nullable(),
    }),
    withClaim: yup.string().when('type', {
      is: (val: string) =>
        val === StatType.ScopedCount || val === StatType.ScopedBalance,
      then: (schema) =>
        schema.when('type', {
          is: StatType.ScopedCount,
          then: () => countValidation,
          otherwise: () => balanceValidation,
        }),
      otherwise: (schema) => schema.nullable(),
    }),
    withoutClaim: yup.string().when('type', {
      is: (val: string) =>
        val === StatType.ScopedCount || val === StatType.ScopedBalance,
      then: (schema) =>
        schema.when('type', {
          is: StatType.ScopedCount,
          then: () => countValidation,
          otherwise: () => balanceValidation,
        }),
      otherwise: (schema) => schema.nullable(),
    }),
  };

  return yup
    .object()
    .shape({ ...baseSchema, ...scopedSchema })
    .test(
      'jurisdiction-fields',
      'Jurisdiction fields must be valid',
      function validateJurisdictionFields(value) {
        const formValue = value as IAddTrackedStatForm;
        const { type } = formValue;

        if (type !== StatType.ScopedCount && type !== StatType.ScopedBalance) {
          return true;
        }

        const validation =
          type === StatType.ScopedCount ? countValidation : balanceValidation;
        const jurisdictionKeys = Object.keys(formValue).filter(
          (key) =>
            key.startsWith('jurisdiction_count_') ||
            key.startsWith('jurisdiction_balance_'),
        );

        const invalidKey = jurisdictionKeys.find((key) => {
          const fieldValue = formValue[key];
          try {
            validation.validateSync(fieldValue);
            return false;
          } catch (error) {
            return true;
          }
        });

        if (invalidKey) {
          return this.createError({
            path: invalidKey,
            message:
              type === StatType.ScopedCount
                ? 'Must be a whole number if provided'
                : 'Must be a valid number with up to 6 decimal places if provided',
          });
        }

        return true;
      },
    );
};

export const createEditStatValidationSchema = (
  statToEdit: TransferRestrictionStatValues | null,
  selectedJurisdictions?: (CountryCode | 'NONE')[],
) => {
  if (!statToEdit) {
    return yup.object().shape({});
  }

  if (statToEdit.type === 'Count') {
    return yup.object().shape({ count: requiredCountValidation });
  }

  if (statToEdit.type === 'Balance') {
    return yup.object().shape({ balance: requiredBalanceValidation });
  }

  if (statToEdit.claim) {
    const { claimType } = statToEdit.claim;

    if (claimType === ClaimType.Jurisdiction && selectedJurisdictions) {
      const schema: Record<string, yup.AnySchema> = {};
      const validation =
        statToEdit.type === 'ScopedCount'
          ? requiredCountValidation
          : requiredBalanceValidation;
      selectedJurisdictions.forEach((code) => {
        schema[`jurisdiction_${code}`] = validation;
      });
      return yup.object().shape(schema);
    }

    const validation =
      statToEdit.type === 'ScopedCount'
        ? requiredCountValidation
        : requiredBalanceValidation;
    return yup.object().shape({
      withClaim: validation,
      withoutClaim: validation,
    });
  }

  return yup.object().shape({});
};

/**
 * Reusable validation for max value field in transfer restrictions
 */
const createMaxValueValidation = (restrictionType: string) => {
  const isPercentage =
    restrictionType === 'Percentage' || restrictionType === 'ClaimPercentage';
  const isCount =
    restrictionType === 'Count' || restrictionType === 'ClaimCount';

  return yup
    .string()
    .required('Maximum value is required')
    .test('is-valid-number', 'Must be a valid number', (value) => {
      if (!value) return false;
      const num = Number(value);
      return !Number.isNaN(num);
    })
    .test(
      'is-valid-range',
      'Must be between 0 and 100 for percentage',
      (value) => {
        if (!value) return true;
        const num = Number(value);
        if (isPercentage) {
          return num >= 0 && num <= 100;
        }
        return num >= 0;
      },
    )
    .test(
      'is-whole-number',
      'Must be a whole number for count restrictions',
      (value) => {
        if (!value) return true;
        const num = Number(value);
        if (isCount) {
          return Number.isInteger(num);
        }
        return true;
      },
    );
};

/**
 * Reusable validation for min value field in transfer restrictions
 */
const createMinValueValidation = (restrictionType: string) => {
  const isPercentage =
    restrictionType === 'Percentage' || restrictionType === 'ClaimPercentage';
  const isCount =
    restrictionType === 'Count' || restrictionType === 'ClaimCount';

  return yup
    .string()
    .nullable()
    .test('is-valid-number', 'Must be a valid number if present', (value) => {
      if (!value) return true;
      const num = Number(value);
      return !Number.isNaN(num) && num >= 0;
    })
    .test(
      'is-valid-range',
      'Must be between 0 and 100 for percentage',
      (value) => {
        if (!value) return true;
        const num = Number(value);
        if (isPercentage) {
          return num >= 0 && num <= 100;
        }
        return num >= 0;
      },
    )
    .test(
      'is-whole-number',
      'Must be a whole number for count restrictions',
      (value) => {
        if (!value) return true;
        const num = Number(value);
        if (isCount) {
          return Number.isInteger(num);
        }
        return true;
      },
    )
    .test(
      'less-than-max',
      'Minimum value must be less than or equal to maximum value',
      function validateMinMax(value) {
        if (!value) return true;
        const min = Number(value);
        const max = Number(this.parent.max);
        if (Number.isNaN(min) || Number.isNaN(max)) return true;
        return min <= max;
      },
    );
};

export const createTransferRestrictionValidationSchema = (
  sdk: Polymesh | null,
  trackedStats: TransferRestrictionStatValues[] = [],
  existingRestrictions: TransferRestriction[] = [],
) => {
  return yup.object().shape({
    type: yup
      .string()
      .required('Restriction type is required')
      .test('stat-exists', function validateStatExists(value) {
        if (!value) return true;

        // Check if corresponding stat exists
        if (value === 'Count') {
          const hasCountStat = trackedStats.some(
            (stat) => stat.type === StatType.Count,
          );
          if (!hasCountStat) {
            return this.createError({
              message:
                'A "Holder Count" tracked statistic must be enabled before adding a Count restriction',
            });
          }
        }

        if (value === 'Percentage') {
          const hasBalanceStat = trackedStats.some(
            (stat) => stat.type === StatType.Balance,
          );
          if (!hasBalanceStat) {
            return this.createError({
              message:
                'A "Total Holder Balance" tracked statistic must be enabled before adding a Percentage restriction',
            });
          }
        }

        return true;
      })
      .test('no-duplicate-simple', function validateNoDuplicateSimple(value) {
        if (!value) return true;

        // Check for duplicate simple (non-scoped) restrictions
        if (value === 'Count') {
          const hasCountRestriction = existingRestrictions.some(
            (r) => r.type === 'Count',
          );
          if (hasCountRestriction) {
            return this.createError({
              message:
                'A Count restriction already exists. Only one Count restriction is allowed per asset.',
            });
          }
        }

        if (value === 'Percentage') {
          const hasPercentageRestriction = existingRestrictions.some(
            (r) => r.type === 'Percentage',
          );
          if (hasPercentageRestriction) {
            return this.createError({
              message:
                'A Percentage restriction already exists. Only one Percentage restriction is allowed per asset.',
            });
          }
        }

        return true;
      }),
    max: yup.lazy((_, options) =>
      createMaxValueValidation(options.parent.type || ''),
    ),
    min: yup.lazy((_, options) =>
      createMinValueValidation(options.parent.type || ''),
    ),
    claimType: yup.string().when('type', {
      is: (val: string) => val === 'ClaimCount' || val === 'ClaimPercentage',
      then: (schema) => schema.required('Claim type is required'),
      otherwise: (schema) => schema.nullable(),
    }),
    issuer: yup.string().when('type', {
      is: (val: string) => val === 'ClaimCount' || val === 'ClaimPercentage',
      then: (schema) =>
        schema
          .required('Claim issuer DID is required')
          .matches(/^0x[0-9a-fA-F]{64}$/, 'Must be a valid DID')
          .test(
            'is-valid-identity',
            'DID does not exist',
            async function validateIssuerDid(value) {
              if (!value || !value.match(/^0x[0-9a-fA-F]{64}$/)) return true;
              if (!sdk) return false;
              try {
                return await sdk.identities.isIdentityValid({
                  identity: value,
                });
              } catch (error) {
                return false;
              }
            },
          )
          .test(
            'stat-exists-for-claim',
            function validateStatExistsForClaim(value) {
              if (!value) return true;
              const { type, claimType } = this.parent;

              if (!type || !claimType) return true;

              // Determine the required stat type
              const requiredStatType =
                type === 'ClaimCount'
                  ? StatType.ScopedCount
                  : StatType.ScopedBalance;

              // Extract base claim type (remove "- Not Present" suffix if exists)
              let baseClaimType = claimType;
              if (claimType === 'Accredited - Not Present') {
                baseClaimType = ClaimType.Accredited;
              } else if (claimType === 'Affiliate - Not Present') {
                baseClaimType = ClaimType.Affiliate;
              }

              // Find matching stat - only check type + claim type + issuer
              // A single stat tracks both present/not-present variants and all jurisdictions
              const hasStat = trackedStats.some((stat) => {
                if (stat.type !== requiredStatType || !stat.claim) return false;
                if (stat.claim.issuer.did !== value) return false;

                // Check claim type matches (base type only)
                const statClaimType =
                  typeof stat.claim.claimType === 'string'
                    ? stat.claim.claimType
                    : 'Custom';

                return statClaimType === baseClaimType;
              });

              if (!hasStat) {
                const statTypeName =
                  type === 'ClaimCount'
                    ? 'Claim Holder Count'
                    : 'Claim Holder Balance';
                return this.createError({
                  message: `A "${statTypeName}" tracked statistic with claim type "${baseClaimType}" and issuer "${value}" must be enabled before adding this restriction`,
                });
              }

              return true;
            },
          )
          .test(
            'no-duplicate-claim-restriction',
            function validateNoDuplicateClaimRestriction(value) {
              if (!value) return true;
              const { type, claimType, jurisdiction } = this.parent;

              if (!type || !claimType) return true;

              // Check for duplicate claim-based restriction
              const hasDuplicate = existingRestrictions.some((r) => {
                if (r.type !== type) return false;

                if (r.type === 'ClaimCount' || r.type === 'ClaimPercentage') {
                  const restrictionValue = r.value;

                  if (restrictionValue.issuer?.did !== value) return false;

                  // Check claim type - access the claim object
                  const restrictionClaim = restrictionValue.claim;
                  if (!restrictionClaim) return false;

                  // Get the claim type from the claim object keys
                  const claimKeys = Object.keys(restrictionClaim);
                  const restrictionClaimType = claimKeys.find(
                    (key) =>
                      key === ClaimType.Jurisdiction ||
                      key === ClaimType.Accredited ||
                      key === ClaimType.Affiliate,
                  );

                  if (claimType === ClaimType.Jurisdiction) {
                    if (restrictionClaimType !== ClaimType.Jurisdiction)
                      return false;
                    // For jurisdiction, check if the country code matches
                    const restrictionCountryCode =
                      restrictionClaim.type === 'Jurisdiction'
                        ? restrictionClaim.countryCode
                        : undefined;
                    const targetCountryCode =
                      jurisdiction === 'NONE' ? undefined : jurisdiction;
                    return restrictionCountryCode === targetCountryCode;
                  }

                  return restrictionClaimType === claimType;
                }

                return false;
              });

              if (hasDuplicate) {
                const restrictionTypeName =
                  type === 'ClaimCount' ? 'Claim Count' : 'Claim Percentage';
                let message = `A ${restrictionTypeName} restriction with claim type "${claimType}" and issuer "${formatDid(value, 8, 8)}"`;
                if (claimType === ClaimType.Jurisdiction && jurisdiction) {
                  if (jurisdiction === 'NONE') {
                    message += ' for "No Jurisdiction"';
                  } else {
                    const countryName =
                      countryCodes.find(
                        (c: { code: string; name: string }) =>
                          c.code === jurisdiction,
                      )?.name || jurisdiction;
                    message += ` for jurisdiction "${countryName}"`;
                  }
                }
                message += ' already exists.';

                return this.createError({ message });
              }

              return true;
            },
          ),
      otherwise: (schema) => schema.nullable(),
    }),
    jurisdiction: yup.string().when('claimType', {
      is: 'Jurisdiction',
      then: (schema) => schema.required('Jurisdiction selection is required'),
      otherwise: (schema) => schema.nullable(),
    }),
  });
};

/**
 * Validation schema for editing transfer restrictions
 * Reuses validation logic from add schema for consistency
 */
export const createEditTransferRestrictionValidationSchema = (
  restrictionType: 'Count' | 'Percentage' | 'ClaimCount' | 'ClaimPercentage',
) => {
  return yup.object().shape({
    max: createMaxValueValidation(restrictionType),
    min: createMinValueValidation(restrictionType),
  });
};

/**
 * Validation schema for adding exemptions to a transfer restriction
 */
export const createAddExemptionsValidationSchema = (
  sdk: Polymesh,
  existingExemptions: string[] = [],
) => {
  return yup.object().shape({
    identities: yup
      .array()
      .of(
        yup.object().shape({
          identity: yup
            .string()
            .required('Identity DID is required')
            .test('is-valid-did', 'Invalid DID format', async (value) => {
              if (!value) return false;
              try {
                const isValid = await sdk.identities.isIdentityValid({
                  identity: value,
                });
                return isValid;
              } catch {
                return false;
              }
            })
            .test(
              'not-already-exempted',
              'This identity is already exempted',
              (value) => {
                if (!value) return true;
                const trimmedValue = value.trim();
                return !existingExemptions.includes(trimmedValue);
              },
            ),
        }),
      )
      .min(1, 'Add at least one identity')
      .test(
        'no-duplicates',
        'Duplicate identities are not allowed',
        function validateNoDuplicates(identities) {
          if (!identities || identities.length === 0) return true;

          const dids = identities
            .map((item) => item?.identity?.trim())
            .filter(Boolean);

          const uniqueDids = new Set(dids);

          if (dids.length !== uniqueDids.size) {
            // Find the first duplicate
            const seenDids = new Set<string>();
            const duplicateIndex = identities.findIndex((item) => {
              const did = item?.identity?.trim();
              if (!did) return false;
              if (seenDids.has(did)) return true;
              seenDids.add(did);
              return false;
            });

            return this.createError({
              path: `identities.${duplicateIndex}.identity`,
              message: 'This identity has already been added',
            });
          }

          return true;
        },
      ),
  });
};
