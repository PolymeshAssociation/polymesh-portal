import { yupResolver } from '@hookform/resolvers/yup';
import { ValidationMode } from 'react-hook-form';
import * as yup from 'yup';

export interface IBasicFieldValues {
  venue: string;
  recipient: string;
  memo?: string;
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
  },
  resolver: yupResolver(
    yup.object().shape({
      venue: yup.string().required('Venue is required'),
      recipient: yup
        .string()
        .required('Recipient is required')
        .min(66, 'Recipiend DID must be valid')
        .max(66, 'Recipiend DID must be valid'),
      memo: yup.string().max(32, 'Memo must be 32 characters or less'),
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
      venue: yup.string().required('Venue is required'),
      tradeDate: yup.date().nullable(),
      valueDate: yup.date().nullable(),
      memo: yup.string().max(32, 'Memo must be 32 characters or less'),
    }),
  ),
};
