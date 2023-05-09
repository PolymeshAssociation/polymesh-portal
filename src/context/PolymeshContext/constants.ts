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
  };
  api: {
    sdk: Polymesh | null;
    signingManager: BrowserExtensionSigningManager | null;
  };
  settings: {
    defaultExtension: string;
    setDefaultExtension: (option: string) => void;
    nodeUrl: string;
    setNodeUrl: (url: string) => void;
  };
  connectWallet: (data: IConnectOptions) => Promise<void>;
}

export const initialState = {
  state: {
    connecting: false,
    initialized: false,
  },
  api: {
    sdk: null,
    signingManager: null,
  },
  settings: {
    defaultExtension: '',
    setDefaultExtension: () => {},
    nodeUrl: '',
    setNodeUrl: () => {},
  },
  connectWallet: async () => {},
};
