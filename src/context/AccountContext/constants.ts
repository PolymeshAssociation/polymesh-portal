import {
  Account,
  Identity,
  MultiSig,
} from '@polymeshassociation/polymesh-sdk/types';

export interface IBalanceByKey {
  key: string;
  totalBalance: string;
  available: boolean;
}

export interface IAccountContext {
  account: Account | MultiSig | null;
  selectedAccount: string;
  allAccounts: string[];
  setSelectedAccount: (account: string) => void;
  identity: Identity | null;
  allIdentities: (Identity | null)[];
  primaryKey: string;
  secondaryKeys: string[];
  identityLoading: boolean;
  allKeyBalances: IBalanceByKey[];
  identityHasValidCdd: boolean;
  accountIsMultisigSigner: boolean;
}

export const initialState = {
  account: null,
  selectedAccount: '',
  allAccounts: [],
  setSelectedAccount: () => {},
  identity: null,
  allIdentities: [],
  primaryKey: '',
  secondaryKeys: [],
  identityLoading: true,
  allKeyBalances: [],
  identityHasValidCdd: false,
  accountIsMultisigSigner: false,
};
