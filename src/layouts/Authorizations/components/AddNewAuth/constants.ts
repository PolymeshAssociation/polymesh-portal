import {
  AuthorizationType,
  TickerReservation,
  Asset,
} from '@polymeshassociation/polymesh-sdk/types';
import { IPortfolioData } from '~/context/PortfolioContext/constants';

export const INPUT_NAMES = {
  TARGET: 'target',
  TARGET_ACCOUNT: 'targetAccount',
  TARGET_IDENTITY: 'targetIdentity',
  EXPIRY: 'expiry',
  PERMISSIONS: 'permissions',
  TICKER: 'ticker',
  ASSET: 'asset',
  GROUP_ID: 'groupId',
  PORTFOLIO: 'portfolio',
};

export interface IFieldValues {
  target: string;
  targetAccount: string;
  targetIdentity: string;
  expiry: string;
  permissions: string;
  ticker: string;
  asset: string;
  groupId: number;
  portfolio: string;
}

export interface IPermissionTypeValue {
  authType: string;
  name: string;
}

export const disabledAuthTypes = [
  AuthorizationType.AttestPrimaryKeyRotation,
  AuthorizationType.AddMultiSigSigner,
];

// Authorization types that are not offered when creating a new authorization.
// Subsidies are not authorization-based on v8 — `approveSubsidy` has its own
// accept and revoke lifecycle, which the Portal does not implement yet — so
// offering the legacy type here would create a subsidy that cannot be
// completed. Existing authorizations of that type still render in the list so
// they can be read and removed.
export const hiddenAuthTypes = [
  AuthorizationType.AttestPrimaryKeyRotation,
  AuthorizationType.OldAddRelayerPayingKey,
];

export type AllowedAuthTypes =
  | AuthorizationType.TransferTicker
  | AuthorizationType.TransferAssetOwnership
  | AuthorizationType.JoinIdentity
  | AuthorizationType.BecomeAgent
  | AuthorizationType.PortfolioCustody
  | AuthorizationType.RotatePrimaryKey
  | AuthorizationType.RotatePrimaryKeyToSecondary;

export const selectInputsDefaultValue = {
  permissions: false,
  asset: false,
  ticker: false,
};

export type AuthTypesWithRequiredEntity =
  | AuthorizationType.PortfolioCustody
  | AuthorizationType.TransferTicker
  | AuthorizationType.BecomeAgent
  | AuthorizationType.TransferAssetOwnership;

export type EntityDataEntry = Asset | TickerReservation | IPortfolioData;
