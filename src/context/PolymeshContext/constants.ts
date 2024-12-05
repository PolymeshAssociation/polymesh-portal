import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { WalletConnectSigningManager } from '@polymeshassociation/walletconnect-signing-manager';
import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  EventRecord,
  MiddlewareMetadata,
} from '@polymeshassociation/polymesh-sdk/types';

export interface IPolymeshContext {
  state: {
    connecting: boolean | null;
    initialized: boolean;
    middlewareMetadata: MiddlewareMetadata | null;
    middlewareLoading: boolean;
  };
  api: {
    sdk: Polymesh | null;
    signingManager:
      | BrowserExtensionSigningManager
      | WalletConnectSigningManager
      | null;
    polkadotApi: Polymesh['_polkadotApi'] | null;
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
    ipfsProviderUrl: string;
    setIpfsProviderUrl: (key: string) => void;
  };
  connectWallet: (extensionName: string) => Promise<void>;
  walletConnectConnected: boolean;
  disconnectWalletConnect: () => Promise<void>;
  ss58Prefix: BigNumber | undefined;
  subscribedEventRecords: {
    events: EventRecord[];
    blockHash: string;
  };
  refreshMiddlewareMetadata: () => Promise<void>;
}

export const initialState = {
  state: {
    connecting: null,
    initialized: false,
    middlewareMetadata: null,
    middlewareLoading: true,
  },
  api: {
    sdk: null,
    signingManager: null,
    polkadotApi: null,
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
    ipfsProviderUrl: '',
    setIpfsProviderUrl: () => {},
  },
  connectWallet: async () => {},
  walletConnectConnected: false,
  disconnectWalletConnect: async () => {},
  ss58Prefix: undefined,
  subscribedEventRecords: { events: [], blockHash: '' },
  refreshMiddlewareMetadata: async () => {},
};

export const IPFS_PROVIDER_URL =
  import.meta.env.VITE_IPFS_PROVIDER_URL || 'https://ipfs.io/ipfs';
