enum Wallet {
  POLYMESH = 'polywallet',
  TALISMAN = 'talisman',
  POLKADOT = 'polkadot-js',
  SUBWALLET = 'subwallet-js',
}

export const WALLET_CONNECT_OPTIONS = [
  {
    walletName: 'Polymesh',
    extensionName: Wallet.POLYMESH,
    iconName: 'PolymeshSymbol',
    isInstalled: true,
    recommended: true,
    downloadUrl:
      'https://chrome.google.com/webstore/detail/polymesh-wallet/jojhfeoedkpkglbfimdfabpdfjaoolaf',
  },
  {
    walletName: 'Polkadot',
    extensionName: Wallet.POLKADOT,
    iconName: 'PolkadotSymbol',
    isInstalled: false,
    recommended: false,
    downloadUrl: 'https://polkadot.js.org/extension/',
  },
  {
    walletName: 'Talisman',
    extensionName: Wallet.TALISMAN,
    iconName: 'TalismanSymbol',
    isInstalled: true,
    recommended: false,
    downloadUrl:
      'https://chrome.google.com/webstore/detail/talisman-polkadot-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld',
  },
  {
    walletName: 'Subwallet',
    extensionName: Wallet.SUBWALLET,
    iconName: 'SubwalletSymbol',
    recommended: false,
    downloadUrl: 'https://subwallet.app/download.html',
  },
];
