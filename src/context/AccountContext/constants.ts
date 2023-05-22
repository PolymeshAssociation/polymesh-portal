import {
  Account,
  Identity,
  MultiSig,
} from '@polymeshassociation/polymesh-sdk/types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

export interface IBalanceByKey {
  key: string;
  totalBalance: string;
  available: boolean;
}

export interface IAccountContext {
  account: Account | MultiSig | null;
  selectedAccount: string;
  allAccounts: string[];
  allAccountsWithMeta: InjectedAccountWithMeta[];
  setSelectedAccount: (account: string) => void;
  defaultAccount: string;
  setDefaultAccount: (account: string) => void;
  blockedWallets: string[];
  blockWalletAddress: (account: string) => void;
  unblockWalletAddress: (account: string) => void;
  identity: Identity | null;
  allIdentities: (Identity | null)[];
  primaryKey: string;
  secondaryKeys: string[];
  identityLoading: boolean;
  allKeyBalances: IBalanceByKey[];
  identityHasValidCdd: boolean;
  accountIsMultisigSigner: boolean;
  refreshAccountIdentity: () => void;
}

export const initialState = {
  account: null,
  selectedAccount: '',
  allAccounts: [],
  allAccountsWithMeta: [],
  setSelectedAccount: () => {},
  defaultAccount: '',
  setDefaultAccount: () => {},
  blockedWallets: [],
  blockWalletAddress: () => {},
  unblockWalletAddress: () => {},
  identity: null,
  allIdentities: [],
  primaryKey: '',
  secondaryKeys: [],
  identityLoading: true,
  allKeyBalances: [],
  identityHasValidCdd: false,
  accountIsMultisigSigner: false,
  refreshAccountIdentity: () => {},
};
