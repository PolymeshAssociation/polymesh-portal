import { TIcons } from '~/assets/icons/types';

export enum Wallet {
  POLYMESH = 'polywallet',
  TALISMAN = 'talisman',
  POLKADOT = 'polkadot-js',
  SUBWALLET = 'subwallet-js',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  NOVA = 'polkadot-js',
}

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

export type TWalletName =
  | typeof POLYMESH_WALLET
  | typeof POLKADOT_WALLET
  | typeof TALISMAN_WALLET
  | typeof SUBWALLET_WALLET
  | typeof NOVA_WALLET;

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
