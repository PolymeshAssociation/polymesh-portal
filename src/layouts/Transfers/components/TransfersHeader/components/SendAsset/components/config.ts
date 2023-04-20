import { yupResolver } from '@hookform/resolvers/yup';
import { ValidationMode } from 'react-hook-form';
import * as yup from 'yup';

export interface IBasicFieldValues {
  venue: string;
  recipient: string;
}

export interface IAdvancedFieldValues {
  venue: string;
  recipient: string;
  tradeDate: Date | null;
  valueDate: Date | null;
}

export const BASIC_FORM_CONFIG = {
  mode: 'onTouched' as keyof ValidationMode,
  defaultValues: {
    venue: '',
    recipient: '',
  },
  resolver: yupResolver(
    yup.object().shape({
      venue: yup.string().required('Venue is required'),
      recipient: yup
        .string()
        .required('Recipient is required')
        .min(66, 'Recipiend DID must be valid')
        .max(66, 'Recipiend DID must be valid'),
    }),
  ),
};

export const ADVANCED_FORM_CONFIG = {
  mode: 'onTouched' as keyof ValidationMode,
  defaultValues: {
    venue: '',
    tradeDate: null,
    valueDate: null,
  },
  resolver: yupResolver(
    yup.object().shape({
      venue: yup.string().required('Venue is required'),
      tradeDate: yup.date().nullable(),
      valueDate: yup.date().nullable(),
    }),
  ),
};
