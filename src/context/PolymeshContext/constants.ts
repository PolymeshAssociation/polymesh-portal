import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { Wallet } from '~/constants/wallets';

export interface IPolymeshContext {
  state: {
    connecting: boolean;
    initialized: boolean;
    walletError: string;
    selectedAccount: string;
    setSelectedAccount: () => void;
  };
  api: {
    sdk: Polymesh;
    signingManager: BrowserExtensionSigningManager;
  };
  connectWallet: () => Promise<void>;
}

export interface IConnectOptions {
  extensionName: Wallet;
  isDefault: boolean;
}
