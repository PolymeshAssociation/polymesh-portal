import { yupResolver } from '@hookform/resolvers/yup';
import { ValidationMode } from 'react-hook-form';
import * as yup from 'yup';

export interface IFieldValues {
  venue: string;
  recipient: string;
}

export const FORM_CONFIG = {
  mode: 'onTouched' as keyof ValidationMode,
  defaultValues: {
    venue: '',
    recipient: '',
  },
  resolver: yupResolver(
    yup.object().shape({
      venue: yup.string().required('Venue is required'),
      recipient: yup.string().required('Recipient is required'),
    }),
  ),
};
