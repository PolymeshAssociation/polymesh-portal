import { TIcons } from '~/assets/icons/types';

export enum Wallet {
  POLYMESH = 'polywallet',
  TALISMAN = 'talisman',
  POLKADOT = 'polkadot-js',
  SUBWALLET = 'subwallet-js',
}

export const WALLET_CONNECT_OPTIONS = [
  {
    walletName: 'Polymesh',
    extensionName: Wallet.POLYMESH,
    iconName: 'PolymeshSymbol' as TIcons,
    recommended: true,
    downloadUrl:
      'https://chrome.google.com/webstore/detail/polymesh-wallet/jojhfeoedkpkglbfimdfabpdfjaoolaf',
  },
  {
    walletName: 'Polkadot',
    extensionName: Wallet.POLKADOT,
    iconName: 'PolkadotSymbol' as TIcons,
    recommended: false,
    downloadUrl: 'https://polkadot.js.org/extension/',
  },
  {
    walletName: 'Talisman',
    extensionName: Wallet.TALISMAN,
    iconName: 'TalismanSymbol' as TIcons,
    recommended: false,
    downloadUrl:
      'https://chrome.google.com/webstore/detail/talisman-polkadot-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld',
  },
  {
    walletName: 'Subwallet',
    extensionName: Wallet.SUBWALLET,
    iconName: 'SubwalletSymbol' as TIcons,
    recommended: false,
    downloadUrl: 'https://subwallet.app/download.html',
  },
];
