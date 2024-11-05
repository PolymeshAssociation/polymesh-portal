import { yupResolver } from '@hookform/resolvers/yup';
import { ValidationMode } from 'react-hook-form';
import * as yup from 'yup';

export interface IBasicFieldValues {
  venue: string;
  recipient: string;
  memo?: string;
  senderPortfolio?: string;
}

export interface IAdvancedFieldValues {
  venue: string;
  recipient: string;
  tradeDate: Date | null;
  valueDate: Date | null;
  memo?: string;
}

export const BASIC_FORM_CONFIG = {
  mode: 'onTouched' as keyof ValidationMode,
  defaultValues: {
    venue: '',
    recipient: '',
    memo: '',
    senderPortfolio: 'default',
  },
  resolver: yupResolver(
    yup.object().shape({
      recipient: yup
        .string()
        .required('Recipient is required')
        .matches(/^0x[0-9a-fA-F]{64}$/, 'Recipient DID must be valid'),
      memo: yup.string().max(32, 'Memo must be 32 characters or less'),
      senderPortfolio: yup.string().required('Portfolio is required'),
    }),
  ),
};

export const ADVANCED_FORM_CONFIG = {
  mode: 'onTouched' as keyof ValidationMode,
  defaultValues: {
    venue: '',
    tradeDate: null,
    valueDate: null,
    memo: '',
  },
  resolver: yupResolver(
    yup.object().shape({
      tradeDate: yup.date().nullable(),
      valueDate: yup.date().nullable(),
      memo: yup.string().max(32, 'Memo must be 32 characters or less'),
    }),
  ),
};
