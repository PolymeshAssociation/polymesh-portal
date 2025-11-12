import { EPermissionType } from '../../constants';

export interface IPermissionData {
  type: EPermissionType;
  values?: string[];
}

export interface ITransactionPermissionData {
  type: EPermissionType;
  values?: Array<{ pallet: string; extrinsics?: string[] }>;
}

export interface ISecondaryKeyPermissions {
  assets: IPermissionData;
  transactions: ITransactionPermissionData;
  portfolios: IPermissionData;
}

export interface ISecondaryKeyData {
  address: string;
  permissions: ISecondaryKeyPermissions;
}

