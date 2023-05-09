import { yupResolver } from '@hookform/resolvers/yup';
import { VenueType } from '@polymeshassociation/polymesh-sdk/types';
import { ValidationMode } from 'react-hook-form';
import * as yup from 'yup';

export interface IFieldValues {
  description: string;
  type: VenueType;
}

export const FORM_CONFIG = {
  mode: 'onTouched' as keyof ValidationMode,
  defaultValues: {
    description: '',
    type: '' as VenueType,
  },
  resolver: yupResolver(
    yup.object().shape({
      description: yup.string().required('Description is required'),
      type: yup.string().required('Type is required'),
    }),
  ),
};
