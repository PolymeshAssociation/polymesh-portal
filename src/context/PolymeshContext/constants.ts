import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

export interface IConnectOptions {
  extensionName: string;
  isDefault: boolean;
}

export interface IPolymeshContext {
  state: {
    connecting: boolean;
    initialized: boolean;
    walletError: string;
    selectedAccount: string;
    setSelectedAccount: (account: string) => void;
  };
  api: {
    sdk: Polymesh | null;
    signingManager: BrowserExtensionSigningManager | null;
  };
  connectWallet: (data: IConnectOptions) => Promise<void>;
}

export const initialState = {
  state: {
    connecting: false,
    initialized: false,
    walletError: '',
    selectedAccount: '',
    setSelectedAccount: () => {},
  },
  api: {
    sdk: null,
    signingManager: null,
  },
  connectWallet: async () => {},
} as const;
