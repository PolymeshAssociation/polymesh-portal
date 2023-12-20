import {
  Account,
  Identity,
  MultiSig,
  MultiSigDetails,
} from '@polymeshassociation/polymesh-sdk/types';
import type {
  AccountIdentityRelation,
  AccountKeyType,
} from '@polymeshassociation/polymesh-sdk/api/entities/Account/types';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

export interface IInfoByKey {
  available: boolean;
  isMultiSig: boolean;
  key: string;
  keyIdentityRelationship: AccountIdentityRelation;
  keyType: AccountKeyType;
  multisigDetails: MultiSigDetails | null;
  totalBalance: string;
}

export interface IAccountBalance {
  free: string;
  locked: string;
  total: string;
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
  accountLoading: boolean;
  identityLoading: boolean;
  allKeyInfo: IInfoByKey[];
  identityHasValidCdd: boolean;
  accountIsMultisigSigner: boolean;
  refreshAccountIdentity: () => void;
  keyIdentityRelationships: Record<string, AccountIdentityRelation>;
  multiSigAccount: MultiSig | null;
  selectedAccountBalance: IAccountBalance;
  balanceIsLoading: boolean;
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
  accountLoading: true,
  identityLoading: true,
  allKeyInfo: [],
  identityHasValidCdd: false,
  accountIsMultisigSigner: false,
  refreshAccountIdentity: () => {},
  keyIdentityRelationships: {},
  multiSigAccount: null,
  selectedAccountBalance: { free: '', locked: '', total: '' },
  balanceIsLoading: false,
};
