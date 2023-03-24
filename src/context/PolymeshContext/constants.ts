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
  },
  api: {
    sdk: null,
    signingManager: null,
  },
  connectWallet: async () => {},
};
