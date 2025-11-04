import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  ClaimType,
  CountryCode,
  StatType,
  TransferRestrictionStatValues,
} from '@polymeshassociation/polymesh-sdk/types';
import * as yup from 'yup';

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
        const { type } = value as { type?: string };
        if (type !== StatType.ScopedCount && type !== StatType.ScopedBalance) {
          return true;
        }

        const validation =
          type === StatType.ScopedCount ? countValidation : balanceValidation;
        const jurisdictionKeys = Object.keys(value).filter(
          (key) =>
            key.startsWith('jurisdiction_count_') ||
            key.startsWith('jurisdiction_balance_'),
        );

        const invalidKey = jurisdictionKeys.find((key) => {
          const fieldValue = value[key as keyof typeof value] as
            | string
            | undefined;
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
