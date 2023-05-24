import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

export interface IPolymeshContext {
  state: {
    connecting: boolean;
    initialized: boolean;
  };
  api: {
    sdk: Polymesh | null;
    signingManager: BrowserExtensionSigningManager | null;
    gqlClient: ApolloClient<NormalizedCacheObject> | null;
  };
  settings: {
    defaultExtension: string;
    setDefaultExtension: (option: string) => void;
    nodeUrl: string;
    setNodeUrl: (url: string) => void;
    middlewareUrl: string;
    setMiddlewareUrl: (url: string) => void;
    middlewareKey: string;
    setMiddlewareKey: (key: string) => void;
  };
  connectWallet: (extensionName: string) => Promise<void>;
}

export const initialState = {
  state: {
    connecting: false,
    initialized: false,
  },
  api: {
    sdk: null,
    signingManager: null,
    gqlClient: null,
  },
  settings: {
    defaultExtension: '',
    setDefaultExtension: () => {},
    nodeUrl: '',
    setNodeUrl: () => {},
    middlewareUrl: '',
    setMiddlewareUrl: () => {},
    middlewareKey: '',
    setMiddlewareKey: () => {},
  },
  connectWallet: async () => {},
};
