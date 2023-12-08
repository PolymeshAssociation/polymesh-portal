import { TransactionStatus } from '@polymeshassociation/polymesh-sdk/types';

export enum EModalOptions {
  STAKE = 'Stake POLYX',
  BOND_MORE = 'Bond More POLYX',
  UNBOND = 'Unbond POLYX',
  REBOND = 'Rebond Unbonding POLYX',
  CHANGE_CONTROLLER = 'Change Controller Address',
  CHANGE_DESTINATION = 'Change Reward Destination',
  CHANGE_NOMINATIONS = 'Change Nominations',
}

export enum EModalActions {
  CHILL = 'chill',
  UNBOND = 'unbond',
  BOND = 'bond',
  BOND_EXTRA = 'bondExtra',
  REBOND = 'rebond',
  SET_CONTROLLER = 'setController',
  SET_PAYEE = 'setPayee',
  NOMINATE = 'nominate',
  WITHDRAW = 'withdrawUnbonded',
}

export const PAYMENT_DESTINATION = {
  Staked: 'Staked',
  Stash: 'Stash',
  Controller: 'Controller',
  Account: 'Account',
} as const;

export const PAYMENT_DESTINATION_LABELS = {
  [PAYMENT_DESTINATION.Staked]: 'Stash address (automatically bond rewards)',
  [PAYMENT_DESTINATION.Stash]: 'Stash address (do not bond rewards)',
  [PAYMENT_DESTINATION.Controller]: 'Controller address',
  [PAYMENT_DESTINATION.Account]: 'Specified address',
} as const;

export interface IStakeTransaction {
  status: Partial<TransactionStatus>;
  tag: string;
  isTxBatch: boolean;
  batchSize: number;
  txHash?: string;
}

export interface IStakeForm {
  controller: string;
  amount: number;
  nominators: string[];
  destination: string;
  specifiedAccount?: string;
}

export interface INominatorsForm {
  nominators: string[];
}

export type TDestination = 'Stash' | 'Staked' | 'Controller';

export interface IStakeArgs {
  controller: string;
  amount: number;
  nominators: string[];
  payee: { Account: string } | TDestination;
}

export type TStakeArgs =
  | IStakeArgs
  | { max_additional: number }
  | { value: number }
  | { Account: string }
  | string[]
  | string;
