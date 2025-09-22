import { SecurityIdentifierType } from '@polymeshassociation/polymesh-sdk/types';
import {
  isCusipValid,
  isFigiValid,
  isIsinValid,
  isLeiValid,
} from '@polymeshassociation/polymesh-sdk/utils';
import * as yup from 'yup';

// Shared validation schema for security identifiers
export const securityIdentifierSchema = yup.object({
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
    ),
});
