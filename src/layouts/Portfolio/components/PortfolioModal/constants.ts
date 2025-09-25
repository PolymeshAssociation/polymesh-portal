import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export enum EModalType {
  ADD = 'add',
  EDIT = 'edit',
}

interface IBaseModalConfig {
  name: string;
  placeholder: string;
  title: string;
}

interface IAddModalConfig extends IBaseModalConfig {
  description: string;
  link: string;
}

interface IEditModalConfig extends IBaseModalConfig {
  description?: never;
  link?: never;
}

type TModalConfig = {
  [EModalType.ADD]: IAddModalConfig;
  [EModalType.EDIT]: IEditModalConfig;
};

export const modalConfig: TModalConfig = {
  [EModalType.ADD]: {
    name: 'name',
    placeholder: 'Enter a name for new portfolio ',
    title: 'Add Portfolio',
    description:
      'Create a new portfolio to organize assets underneath your identity, and to flexibly assign key permissions and custody. A particular asset can have different balances across portfolios within the same identity.',
    link: 'https://developers.polymesh.network/portfolios/',
  },
  [EModalType.EDIT]: {
    name: 'name',
    placeholder: 'Enter a new name for this portfolio',
    title: 'Edit Portfolio Name',
  },
};

// ...existing code for createFormConfig remains the same...

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
