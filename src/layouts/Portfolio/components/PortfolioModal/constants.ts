import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export enum EModalType {
  ADD = 'add',
  EDIT = 'edit',
}

export const modalConfig = {
  [EModalType.ADD]: {
    name: 'name',
    placeholder: 'Enter a name for new portfolio',
    title: 'Add Portfolio',
  },
  [EModalType.EDIT]: {
    name: 'name',
    placeholder: 'Enter a new name for this portfolio',
    title: 'Edit Portfolio Name',
  },
};

export const createFormConfig = (nameValue: string) => {
  return {
    mode: 'onTouched',
    defaultValues: {
      name: nameValue,
    },
    resolver: yupResolver(
      yup.object().shape({
        name: yup
          .string()
          .required('Valid name is required')
          .max(32, 'Name must be 32 characters or less'),
      }),
    ),
  } as const;
};
