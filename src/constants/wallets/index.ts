import { TIcons } from '~/assets/icons/types';

export enum Wallet {
  POLYMESH = 'polywallet',
  TALISMAN = 'talisman',
  POLKADOT = 'polkadot-js',
  SUBWALLET = 'subwallet-js',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  NOVA = 'polkadot-js',
  METAMASK = 'metamask',
}

/** Identifier used for the WalletConnect connection, which is not a browser extension */
export const WALLET_CONNECT = 'walletConnect';

/**
 * Wallets that sign with an Ethereum key rather than a Polkadot one. These connect through the
 * `revive` pallet, dispatching as the Account `<h160> ++ [0xEE; 12]`, and so require a chain that
 * has that pallet.
 */
const EVM_WALLETS: readonly string[] = [Wallet.METAMASK];

export const isEvmWallet = (extensionName: string): boolean =>
  EVM_WALLETS.includes(extensionName);

export enum PlatformOptions {
  Mobile = 'Mobile',
  Computer = 'Computer',
  Both = 'Both',
}

export const POLYMESH_WALLET = 'Polymesh';
export const POLKADOT_WALLET = 'Polkadot';
export const TALISMAN_WALLET = 'Talisman';
export const SUBWALLET_WALLET = 'Subwallet';
export const NOVA_WALLET = 'Nova';
export const METAMASK_WALLET = 'MetaMask';

export type TWalletName =
  | typeof POLYMESH_WALLET
  | typeof POLKADOT_WALLET
  | typeof TALISMAN_WALLET
  | typeof SUBWALLET_WALLET
  | typeof NOVA_WALLET
  | typeof METAMASK_WALLET;

export interface IExtensionConnectOption {
  walletName: TWalletName;
  extensionName: Wallet;
  iconName: TIcons;
  recommended: boolean;
  downloadUrl: string;
  platform: PlatformOptions;
}

export const EXTENSION_CONNECT_OPTIONS: {
  [key: string]: IExtensionConnectOption;
} = {
  [POLYMESH_WALLET]: {
    walletName: POLYMESH_WALLET,
    extensionName: Wallet.POLYMESH,
    iconName: 'PolymeshSymbol' as TIcons,
    recommended: false,
    downloadUrl:
      'https://chrome.google.com/webstore/detail/polymesh-wallet/jojhfeoedkpkglbfimdfabpdfjaoolaf',
    platform: PlatformOptions.Computer,
  },
  [POLKADOT_WALLET]: {
    walletName: POLKADOT_WALLET,
    extensionName: Wallet.POLKADOT,
    iconName: 'PolkadotSymbol' as TIcons,
    recommended: false,
    downloadUrl: 'https://polkadot.js.org/extension/',
    platform: PlatformOptions.Computer,
  },
  [TALISMAN_WALLET]: {
    walletName: TALISMAN_WALLET,
    extensionName: Wallet.TALISMAN,
    iconName: 'TalismanSymbol' as TIcons,
    recommended: false,
    downloadUrl:
      'https://chrome.google.com/webstore/detail/talisman-polkadot-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld',
    platform: PlatformOptions.Computer,
  },
  [SUBWALLET_WALLET]: {
    walletName: SUBWALLET_WALLET,
    extensionName: Wallet.SUBWALLET,
    iconName: 'SubwalletSymbol' as TIcons,
    recommended: false,
    downloadUrl: 'https://subwallet.app/download.html',
    platform: PlatformOptions.Both,
  },
  [NOVA_WALLET]: {
    walletName: NOVA_WALLET,
    extensionName: Wallet.NOVA,
    iconName: 'NovaWalletLogo' as TIcons,
    recommended: false,
    downloadUrl: 'https://novawallet.io/',
    platform: PlatformOptions.Mobile,
  },
};

/**
 * Wallets that sign with an Ethereum key. Kept apart from {@link EXTENSION_CONNECT_OPTIONS} because
 * they are not Polkadot injected extensions: they are discovered through EIP-6963 / `window.ethereum`
 * rather than `BrowserExtensionSigningManager.getExtensionList()`, and they only work on a chain
 * carrying the `revive` pallet.
 */
export const EVM_CONNECT_OPTIONS: {
  [key: string]: IExtensionConnectOption;
} = {
  [METAMASK_WALLET]: {
    walletName: METAMASK_WALLET,
    extensionName: Wallet.METAMASK,
    iconName: 'MetaMaskSymbol' as TIcons,
    recommended: false,
    downloadUrl: 'https://metamask.io/download/',
    platform: PlatformOptions.Computer,
  },
};
