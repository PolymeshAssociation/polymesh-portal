import {
  Asset,
  AuthorizationType,
  TickerReservation,
} from '@polymeshassociation/polymesh-sdk/types';
import { IPortfolioData } from '~/context/PortfolioContext/constants';

export const INPUT_NAMES = {
  TARGET: 'target',
  TARGET_ACCOUNT: 'targetAccount',
  TARGET_IDENTITY: 'targetIdentity',
  EXPIRY: 'expiry',
  ALLOWANCE: 'allowance',
  BENEFICIARY: 'beneficiary',
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
  allowance: string;
  beneficiary: string;
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
  AuthorizationType.RotatePrimaryKey,
  AuthorizationType.RotatePrimaryKeyToSecondary,
  AuthorizationType.AddMultiSigSigner,
];

export type AllowedAuthTypes =
  | AuthorizationType.TransferTicker
  | AuthorizationType.TransferAssetOwnership
  | AuthorizationType.JoinIdentity
  | AuthorizationType.AddRelayerPayingKey
  | AuthorizationType.BecomeAgent
  | AuthorizationType.PortfolioCustody;

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

export type EntityDataOptions =
  | Asset[]
  | TickerReservation[]
  | IPortfolioData[];
