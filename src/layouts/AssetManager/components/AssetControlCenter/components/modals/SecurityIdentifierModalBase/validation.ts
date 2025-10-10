import { SecurityIdentifierType } from '@polymeshassociation/polymesh-sdk/types';
import {
  isCusipValid,
  isFigiValid,
  isIsinValid,
  isLeiValid,
} from '@polymeshassociation/polymesh-sdk/utils';
import * as yup from 'yup';
import { SecurityIdentifier } from '../../../types';

interface CreateSchemaOptions {
  existingIdentifiers: SecurityIdentifier[];
  identifierToExclude?: SecurityIdentifier | null;
}

// Factory function to create validation schema with duplicate checking
export const createSecurityIdentifierSchema = ({
  existingIdentifiers,
  identifierToExclude,
}: CreateSchemaOptions) => {
  return yup.object({
    type: yup.string().required('Identifier type is required'),
    value: yup
      .string()
      .required('Identifier value is required')
      .test(
        'identifier-valid',
        'Invalid security identifier',
        function validateIdentifier(value) {
          const { type } = this.parent;
          let error = false;
          switch (type) {
            case SecurityIdentifierType.Isin: {
              if (!isIsinValid(value)) {
                error = true;
              }
              break;
            }
            case SecurityIdentifierType.Lei: {
              if (!isLeiValid(value)) {
                error = true;
              }
              break;
            }
            case SecurityIdentifierType.Figi: {
              if (!isFigiValid(value)) {
                error = true;
              }
              break;
            }
            // CINS and CUSIP use the same validation
            default: {
              if (!isCusipValid(value)) {
                error = true;
              }
            }
          }
          return !error;
        },
      )
      .test(
        'identifier-duplicate',
        'This identifier already exists',
        function validateDuplicate(value) {
          const { type } = this.parent;

          // Check if this type+value combination already exists
          const isDuplicate = existingIdentifiers.some((identifier) => {
            // Skip the identifier being edited
            if (
              identifierToExclude &&
              identifier.id === identifierToExclude.id
            ) {
              return false;
            }
            return identifier.type === type && identifier.value === value;
          });

          return !isDuplicate;
        },
      ),
  });
};
