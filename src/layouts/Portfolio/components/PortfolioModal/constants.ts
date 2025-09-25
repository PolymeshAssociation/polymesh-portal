import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export enum EModalType {
  ADD = 'add',
  EDIT = 'edit',
}

interface IModalConfig {
  name: string;
  placeholder: string;
  title: string;
  description?: string;
  link?: string;
}

export const modalConfig: Record<EModalType, IModalConfig> = {
  [EModalType.ADD]: {
    name: 'name',
    placeholder: 'Enter a name for new portfolio',
    title: 'Add Portfolio',
    description:
      'Portfolios organize asset balances under your identity. Portfolio control can be assigned to other identities, or secondary keys linked to your identity can be granted permissions to interact with specific portfolios.',
    link: 'https://developers.polymesh.network/portfolios/',
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
