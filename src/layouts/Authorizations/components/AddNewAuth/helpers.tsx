import {
  AuthorizationType,
  PermissionGroupType,
  TickerReservation,
  Asset,
} from '@polymeshassociation/polymesh-sdk/types';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import {
  EntityDataEntry,
  INPUT_NAMES,
  IPermissionTypeValue,
} from './constants';

export const configureInputs = (type: `${AuthorizationType}` | null) => {
  switch (type) {
    case AuthorizationType.TransferTicker:
      return [
        {
          id: INPUT_NAMES.TARGET,
          label: 'Target DID',
          type: 'text',
          placeholder: 'Enter DID',
        },
        {
          id: INPUT_NAMES.EXPIRY,
          label: 'Expiry Date (Optional)',
          type: 'date',
        },
        {
          id: INPUT_NAMES.TICKER,
          label: 'Ticker',
          type: 'select',
        },
      ];
    case AuthorizationType.TransferAssetOwnership:
      return [
        {
          id: INPUT_NAMES.TARGET,
          label: 'Target DID',
          type: 'text',
          placeholder: 'Enter DID',
        },
        {
          id: INPUT_NAMES.EXPIRY,
          label: 'Expiry Date (Optional)',
          type: 'date',
        },
        {
          id: INPUT_NAMES.ASSET,
          label: 'Asset',
          type: 'select',
        },
      ];
    case AuthorizationType.JoinIdentity:
      return [
        {
          id: INPUT_NAMES.TARGET_ACCOUNT,
          label: 'Target Account',
          type: 'text',
          placeholder: 'Enter Account key',
        },
        {
          id: INPUT_NAMES.EXPIRY,
          label: 'Expiry Date (Optional)',
          type: 'date',
        },
        // permissions
        // {

        // }
      ];
    case AuthorizationType.PortfolioCustody:
      return [
        {
          id: INPUT_NAMES.TARGET_IDENTITY,
          label: 'Target DID',
          type: 'text',
          placeholder: 'Enter DID',
        },
        {
          id: INPUT_NAMES.EXPIRY,
          label: 'Expiry Date (Optional)',
          type: 'date',
        },
        {
          id: INPUT_NAMES.PORTFOLIO,
          label: 'Portfolio',
          type: 'select',
        },
      ];
    case AuthorizationType.BecomeAgent:
      return [
        {
          id: INPUT_NAMES.TARGET,
          label: 'Target DID',
          type: 'text',
          placeholder: 'Enter DID',
        },
        {
          id: INPUT_NAMES.EXPIRY,
          label: 'Expiry Date (Optional)',
          type: 'date',
        },
        {
          id: INPUT_NAMES.ASSET,
          label: 'Asset',
          type: 'select',
        },
        {
          id: INPUT_NAMES.PERMISSIONS,
          label: 'Permissions',
          type: 'select',
          values: [
            { authType: PermissionGroupType.Full, name: 'Full Permissions' },
            {
              authType: PermissionGroupType.ExceptMeta,
              name: 'Full without Agent Permissions',
            },
            {
              authType: PermissionGroupType.PolymeshV1Caa,
              name: 'Corporate Action Agent',
            },
            {
              authType: PermissionGroupType.PolymeshV1Pia,
              name: 'Primary Issuance Agent',
            },
            {
              authType: 'Custom',
              name: 'Custom Permissions',
            },
          ] as IPermissionTypeValue[],
        },
        {
          id: INPUT_NAMES.GROUP_ID,
          label: 'Custom Permission group ID',
          type: 'text',
          placeholder: 'Enter ID',
        },
      ];
    case AuthorizationType.AddRelayerPayingKey:
      return [
        {
          id: INPUT_NAMES.ALLOWANCE,
          label: 'Allowance',
          type: 'text',
          placeholder: 'Enter POLYX amount',
        },
        {
          id: INPUT_NAMES.BENEFICIARY,
          label: 'Beneficiary',
          type: 'text',
          placeholder: 'Enter Account to subsidize',
        },
      ];
    case AuthorizationType.RotatePrimaryKey:
      return [
        {
          id: INPUT_NAMES.TARGET_ACCOUNT,
          label: 'Target Account',
          type: 'text',
          placeholder: 'Enter Account key',
        },
        {
          id: INPUT_NAMES.EXPIRY,
          label: 'Expiry Date (Optional)',
          type: 'date',
        },
      ];
    case AuthorizationType.RotatePrimaryKeyToSecondary:
      return [
        {
          id: INPUT_NAMES.TARGET_ACCOUNT,
          label: 'Target Account',
          type: 'text',
          placeholder: 'Enter Account key',
        },
        {
          id: INPUT_NAMES.EXPIRY,
          label: 'Expiry Date (Optional)',
          type: 'date',
        },
      ];

    default:
      return [];
  }
};

export const renderParsedSelectedValue = (
  selectedValue: string | IPermissionTypeValue | number | undefined,
  permissionValues?: IPermissionTypeValue[],
) => {
  if (!selectedValue) return 'Select...';

  if (!permissionValues) return selectedValue as string;

  const parsedValue = permissionValues.find(
    ({ authType }) => authType === selectedValue,
  )?.name;
  return parsedValue || '';
};

export const isPortfolioData = (
  entity: EntityDataEntry,
): entity is IPortfolioData => {
  return (entity as IPortfolioData).name !== undefined;
};

export const isAsset = (entity: EntityDataEntry): entity is Asset => {
  return 'id' in entity && 'freeze' in entity;
};

export const isTickerReservation = (
  entity: EntityDataEntry,
): entity is TickerReservation => {
  return (
    (entity as TickerReservation).ticker !== undefined && 'extend' in entity
  );
};
