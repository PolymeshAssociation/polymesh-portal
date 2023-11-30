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

interface IWalletConnectOption {
  walletName: string;
  extensionName: Wallet;
  iconName: TIcons;
  recommended: boolean;
  downloadUrl: string;
  platform: PlatformOptions;
}

export const WALLET_CONNECT_OPTIONS: IWalletConnectOption[] = [
  {
    walletName: 'Polymesh',
    extensionName: Wallet.POLYMESH,
    iconName: 'PolymeshSymbol' as TIcons,
    recommended: false,
    downloadUrl:
      'https://chrome.google.com/webstore/detail/polymesh-wallet/jojhfeoedkpkglbfimdfabpdfjaoolaf',
    platform: PlatformOptions.Computer,
  },
  {
    walletName: 'Polkadot',
    extensionName: Wallet.POLKADOT,
    iconName: 'PolkadotSymbol' as TIcons,
    recommended: false,
    downloadUrl: 'https://polkadot.js.org/extension/',
    platform: PlatformOptions.Computer,
  },
  {
    walletName: 'Talisman',
    extensionName: Wallet.TALISMAN,
    iconName: 'TalismanSymbol' as TIcons,
    recommended: false,
    downloadUrl:
      'https://chrome.google.com/webstore/detail/talisman-polkadot-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld',
    platform: PlatformOptions.Computer,
  },
  {
    walletName: 'Subwallet',
    extensionName: Wallet.SUBWALLET,
    iconName: 'SubwalletSymbol' as TIcons,
    recommended: false,
    downloadUrl: 'https://subwallet.app/download.html',
    platform: PlatformOptions.Both,
  },
  {
    walletName: 'Nova',
    extensionName: Wallet.NOVA,
    iconName: 'NovaWalletLogo' as TIcons,
    recommended: false,
    downloadUrl: 'https://novawallet.io/',
    platform: PlatformOptions.Mobile,
  },
];
