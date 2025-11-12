import {
  PermissionType,
  type PermissionsLike,
} from '@polymeshassociation/polymesh-sdk/types';

/**
 * Centralized type definitions for Secondary Key Permissions feature
 */

export type PermissionScopeType = 'Whole' | 'These' | 'Except' | 'None';

export type ExtrinsicPermissionScopeType = Omit<PermissionScopeType, 'Except'>;

export enum EPermissionStep {
  ASSETS = 1,
  EXTRINSICS = 2,
  PORTFOLIOS = 3,
  REVIEW = 4,
}

export interface IPermissionFormData {
  assets: {
    type: PermissionScopeType;
    values: string[];
  };
  transactions: {
    type: ExtrinsicPermissionScopeType;
    values: Array<{ pallet: string; extrinsics?: string[] | null }>;
  };
  portfolios: {
    type: PermissionScopeType;
    values: Array<{ id: string; name?: string; ownerDid?: string }>;
  };
}

/**
 * Represents "no access" - all permissions set to empty arrays.
 */
export const noAccessSdkPermissions: PermissionsLike = {
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
};
