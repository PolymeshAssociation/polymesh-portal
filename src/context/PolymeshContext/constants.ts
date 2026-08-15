import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { EthSigningManager } from '@polymeshassociation/eth-signing-manager';
import { WalletConnectSigningManager } from '@polymeshassociation/walletconnect-signing-manager';
import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  EventRecord,
  MiddlewareMetadata,
} from '@polymeshassociation/polymesh-sdk/types';

/**
 * Every Signing Manager the Portal can connect. `EthSigningManager` differs from the others in that
 * it signs with an Ethereum key and dispatches through the `revive` pallet.
 */
export type TSigningManager =
  | BrowserExtensionSigningManager
  | WalletConnectSigningManager
  | EthSigningManager;

export interface IPolymeshContext {
  state: {
    connecting: boolean | null;
    initialized: boolean;
    signingManagerLoading: boolean;
    middlewareMetadata: MiddlewareMetadata | null;
    middlewareLoading: boolean;
  };
  api: {
    sdk: Polymesh | null;
    signingManager: TSigningManager | null;
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
  /**
   * True when an Ethereum wallet is connected but pointed at a different chain than the connected
   * Polymesh node. MetaMask signs *and broadcasts*, so it must be on the right network to submit
   */
  evmNetworkMismatch: boolean;
  /** Prompt the connected Ethereum wallet to switch to the Polymesh network */
  switchEvmNetwork: () => Promise<void>;
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
    signingManagerLoading: false,
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
  evmNetworkMismatch: false,
  switchEvmNetwork: async () => {},
  ss58Prefix: undefined,
  subscribedEventRecords: { events: [], blockHash: '' },
  refreshMiddlewareMetadata: async () => {},
};

export const IPFS_PROVIDER_URL =
  import.meta.env.VITE_IPFS_PROVIDER_URL || 'https://ipfs.io/ipfs';
