import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { PermissionType } from '@polymeshassociation/polymesh-sdk/types';
import { EPermissionType } from './constants';
import { ISecondaryKeyData } from './components/SecondaryKeyItem/helpers';
import { IPermissionFormData } from './components/AddPermission/constants';

interface SecondaryAccountPermissions {
  account: { address: string };
  permissions: {
    assets: {
      type: 'Include' | 'Exclude';
      values: Array<{ id: string }>;
    } | null;
    transactions: {
      type: 'Include' | 'Exclude';
      values: string[];
    } | null;
    portfolios: {
      type: 'Include' | 'Exclude';
      values: Array<{ owner: { did: string }; id?: { toString: () => string } }>;
    } | null;
  };
}

/**
 * Converts SDK permissions to our internal format
 */
export const convertSdkPermissionsToKeyData = (
  secondaryAccount: SecondaryAccountPermissions
): ISecondaryKeyData => {
  const { account, permissions } = secondaryAccount;

  // Assets Permission
  const assetsPermission = permissions.assets
    ? permissions.assets.type === 'Include' && permissions.assets.values.length === 0
      ? { type: EPermissionType.NONE, values: [] }
      : {
          type: permissions.assets.type === 'Include' 
            ? EPermissionType.THESE 
            : EPermissionType.EXCEPT,
          values: permissions.assets.values.map((asset: { id: string }) => asset.id),
        }
    : { type: EPermissionType.WHOLE, values: undefined };

  // Transactions Permission
  const transactionsPermission = permissions.transactions
    ? permissions.transactions.type === 'Include' && permissions.transactions.values.length === 0
      ? { type: EPermissionType.NONE, values: [] }
      : {
          type: permissions.transactions.type === 'Include'
            ? EPermissionType.THESE
            : EPermissionType.EXCEPT,
          values: permissions.transactions.values.map((value: string) => ({
            pallet: value.includes('.') ? value.split('.')[0] : value,
            extrinsics: value.includes('.') ? [value.split('.')[1]] : undefined,
          })),
        }
    : { type: EPermissionType.WHOLE, values: undefined };

  // Portfolios Permission
  const portfoliosPermission = permissions.portfolios
    ? permissions.portfolios.type === 'Include' && permissions.portfolios.values.length === 0
      ? { type: EPermissionType.NONE, values: [] }
      : {
          type: permissions.portfolios.type === 'Include'
            ? EPermissionType.THESE
            : EPermissionType.EXCEPT,
          values: permissions.portfolios.values.map((portfolio: { owner: { did: string }; id?: { toString: () => string } }) => {
            const portfolioId = portfolio.id ? portfolio.id.toString() : 'default';
            return `${portfolio.owner.did}/${portfolioId}`;
          }),
        }
    : { type: EPermissionType.WHOLE, values: undefined };

  return {
    address: account.address,
    permissions: {
      assets: assetsPermission,
      transactions: transactionsPermission,
      portfolios: portfoliosPermission,
    },
  };
};

/**
 * Converts UI permission format to SDK permission format
 */
export const convertUiPermissionsToSdk = async (
  permissions: IPermissionFormData,
  identity: any
): Promise<any> => {
  const sdkPermissions: any = {};

  // Assets
  if (permissions.assets.type === 'Whole') {
    sdkPermissions.assets = null;
  } else if (permissions.assets.type === 'None') {
    sdkPermissions.assets = {
      type: PermissionType.Include,
      values: [],
    };
  } else {
    sdkPermissions.assets = {
      type: permissions.assets.type === 'These' ? PermissionType.Include : PermissionType.Exclude,
      values: permissions.assets.values,
    };
  }

  // Transactions
  if (permissions.transactions.type === 'Whole') {
    sdkPermissions.transactions = null;
  } else if (permissions.transactions.type === 'None') {
    sdkPermissions.transactions = {
      type: PermissionType.Include,
      values: [],
    };
  } else {
    const txTags: string[] = [];
    permissions.transactions.values.forEach(({ pallet, extrinsics }) => {
      if (extrinsics && extrinsics.length > 0) {
        extrinsics.forEach((extrinsic) => {
          txTags.push(`${pallet}.${extrinsic}`);
        });
      } else {
        txTags.push(pallet);
      }
    });

    sdkPermissions.transactions = {
      type: PermissionType.Include,
      values: txTags,
    };
  }

  // Portfolios
  if (permissions.portfolios.type === 'Whole') {
    sdkPermissions.portfolios = null;
  } else if (permissions.portfolios.type === 'None') {
    sdkPermissions.portfolios = {
      type: PermissionType.Include,
      values: [],
    };
  } else {
    const portfolioValues = await Promise.all(
      permissions.portfolios.values.map(async (portfolioId) => {
        if (portfolioId === '0' || portfolioId === 'default') {
          return identity.portfolios.getPortfolio();
        }
        return identity.portfolios.getPortfolio({ 
          portfolioId: new BigNumber(portfolioId) 
        });
      })
    );

    sdkPermissions.portfolios = {
      type: permissions.portfolios.type === 'These' ? PermissionType.Include : PermissionType.Exclude,
      values: portfolioValues,
    };
  }

  return sdkPermissions;
};

/**
 * Creates empty permissions object for removing permissions
 */
export const createEmptyPermissions = () => ({
  assets: {
    type: PermissionType.Include,
    values: [],
  },
  transactions: {
    type: PermissionType.Include,
    values: [],
  },
  portfolios: {
    type: PermissionType.Include,
    values: [],
  },
});

/**
 * Converts SecondaryKeyData to PermissionFormData
 */
export const convertKeyDataToFormData = (
  key: ISecondaryKeyData
): IPermissionFormData => ({
  assets: {
    type: key.permissions.assets.type as 'Whole' | 'These' | 'Except' | 'None',
    values: key.permissions.assets.values || [],
  },
  transactions: {
    type: key.permissions.transactions.type as 'Whole' | 'These' | 'None',
    values: key.permissions.transactions.values || [],
  },
  portfolios: {
    type: key.permissions.portfolios.type as 'Whole' | 'These' | 'Except' | 'None',
    values: key.permissions.portfolios.values || [],
  },
});
