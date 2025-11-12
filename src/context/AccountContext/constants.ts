import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type {
  AccountIdentityRelation,
  AccountKeyType,
} from '@polymeshassociation/polymesh-sdk/api/entities/Account/types';
import {
  Account,
  Identity,
  MultiSig,
  MultiSigDetails,
  PermissionedAccount,
} from '@polymeshassociation/polymesh-sdk/types';

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

export enum EKeyIdentityStatus {
  VERIFIED = 'Verified',
  PENDING = 'Pending Verification',
  UNASSIGNED = 'Unassigned',
}

export interface IApplication {
  id: string;
  address: string;
  url: string;
  externalId: string;
  provider: string;
  timestamp: string;
}
export interface IKeyCddState {
  identity: null | { did: string; validCdd: boolean };
  status: EKeyIdentityStatus;
  applications?: IApplication[];
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
  secondaryKeys: PermissionedAccount[];
  secondaryKeysLoading: boolean;
  accountLoading: boolean;
  identityLoading: boolean;
  allKeyInfo: IInfoByKey[];
  identityHasValidCdd: boolean;
  accountIsMultisigSigner: boolean;
  refreshAccountIdentity: () => void;
  refreshSecondaryKeys: () => void;
  keyIdentityRelationships: Record<string, AccountIdentityRelation>;
  multiSigAccount: MultiSig | null;
  selectedAccountBalance: IAccountBalance;
  balanceIsLoading: boolean;
  rememberSelectedAccount: boolean;
  setRememberSelectedAccount: (shouldRemember: boolean) => void;
  lastExternalKey: string;
  keyCddVerificationInfo: null | IKeyCddState;
  isExternalConnection: boolean;
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
  secondaryKeysLoading: false,
  accountLoading: true,
  identityLoading: true,
  allKeyInfo: [],
  identityHasValidCdd: false,
  accountIsMultisigSigner: false,
  refreshAccountIdentity: () => {},
  refreshSecondaryKeys: () => {},
  keyIdentityRelationships: {},
  multiSigAccount: null,
  selectedAccountBalance: { free: '', locked: '', total: '' },
  balanceIsLoading: false,
  rememberSelectedAccount: true,
  setRememberSelectedAccount: () => {},
  lastExternalKey: '',
  keyCddVerificationInfo: null,
  isExternalConnection: false,
};
