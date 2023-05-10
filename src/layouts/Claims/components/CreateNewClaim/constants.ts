import { ValidationMode } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  ClaimType,
  CountryCode,
  ScopeType,
} from '@polymeshassociation/polymesh-sdk/types';

export interface ISelectedClaimItem {
  claimType: ClaimType;
  expiry: Date | null;
  code?: CountryCode | null;
}

export const INPUT_NAMES = {
  TARGET_DID: 'target',
  SCOPE_TYPE: 'scopeType',
  SCOPE_VALUE: 'scopeValue',
};

export interface IFieldValues {
  target: string;
  scopeType: ScopeType;
  scopeValue: string;
}

export const FORM_CONFIG = {
  mode: 'onTouched' as keyof ValidationMode,
  defaultValues: {
    [INPUT_NAMES.TARGET_DID]: '',
    [INPUT_NAMES.SCOPE_TYPE]: '',
    [INPUT_NAMES.SCOPE_VALUE]: '',
  },
  resolver: yupResolver(
    yup.object().shape({
      [INPUT_NAMES.TARGET_DID]: yup
        .string()
        .matches(/^0x[0-9a-fA-F]{64}$/, 'Target DID must be valid')
        .required('Target is required'),
      [INPUT_NAMES.SCOPE_TYPE]: yup.string().required('Scope type is required'),
      [INPUT_NAMES.SCOPE_VALUE]: yup
        .string()
        .when(INPUT_NAMES.SCOPE_TYPE, (scopeTypes: ScopeType[], schema) => {
          if (scopeTypes[0] === ScopeType.Identity) {
            return schema
              .required('Value is required')
              .matches(/^0x[0-9a-fA-F]{64}$/, 'DID must be valid');
          }
          if (scopeTypes[0] === ScopeType.Ticker) {
            return schema
              .required('Value is required')
              .max(12, 'Value must be 12 characters or less');
          }

          return schema.required('Value is required');
        }),
    }),
  ),
};

export const CLAIM_ITEMS = [
  {
    label: 'Buy Lockup',
    value: ClaimType.BuyLockup,
  },
  {
    label: 'Sell Lockup',
    value: ClaimType.SellLockup,
  },
  {
    label: 'KYC',
    value: ClaimType.KnowYourCustomer,
  },
  {
    label: 'Jurisdiction',
    value: ClaimType.Jurisdiction,
  },
  {
    label: 'Accredited',
    value: ClaimType.Accredited,
  },
  {
    label: 'Affiliate',
    value: ClaimType.Affiliate,
  },
  {
    label: 'Exempted',
    value: ClaimType.Exempted,
  },
  {
    label: 'Blocked',
    value: ClaimType.Blocked,
  },
];
