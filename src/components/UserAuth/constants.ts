import {
  METAMASK_WALLET,
  NOVA_WALLET,
  POLKADOT_WALLET,
  POLYMESH_WALLET,
  SUBWALLET_WALLET,
  TALISMAN_WALLET,
  TWalletName,
} from '~/constants/wallets';

export enum EActionButtonStatus {
  ACTION_ACTIVE = 'active',
  ACTION_DISABLED = 'disabled',
  ACTION_DONE = 'done',
}

export const WALLET_FEATURES_LIST = {
  [POLYMESH_WALLET as TWalletName]: [
    'Most convenient',
    'Browser support: Google Chrome, Brave and Edge',
  ],
  [POLKADOT_WALLET as TWalletName]: [
    'Multichain support',
    'Browser support: Google Chrome, Firefox, Brave and Edge',
  ],
  [SUBWALLET_WALLET as TWalletName]: [
    'Multichain support',
    'Browser support: Google Chrome, Firefox, Brave and Edge',
    'Mobile App',
  ],
  [TALISMAN_WALLET as TWalletName]: [
    'Multichain support',
    'Browser support: Google Chrome, Firefox, Brave and Edge',
  ],
  [METAMASK_WALLET as TWalletName]: [
    'Sign with an Ethereum key',
    'Browser support: Google Chrome, Firefox, Brave and Edge',
  ],
};

export const WALLET_FEATURES_LIST_MOBILE = {
  [SUBWALLET_WALLET as TWalletName]: 'Mobile and Desktop',
  [NOVA_WALLET as TWalletName]: 'Mobile only',
};

export const SUPPORTED_BROWSERS = {
  [POLYMESH_WALLET as TWalletName]: {
    tickers: ['Chrome'],
    names: ['Google Chrome'],
  },
  [POLKADOT_WALLET as TWalletName]: {
    tickers: ['Chrome', 'Firefox'],
    names: ['Google Chrome', 'Firefox'],
  },
  [SUBWALLET_WALLET as TWalletName]: {
    tickers: ['Chrome', 'Firefox', 'Edg'],
    names: ['Google Chrome', 'Firefox', 'Brave', 'Edge'],
  },
  [TALISMAN_WALLET as TWalletName]: {
    tickers: ['Chrome'],
    names: ['Google Chrome', 'Firefox'],
  },
  [NOVA_WALLET as TWalletName]: {
    tickers: ['Chrome'],
    names: ['Google Chrome'],
  },
};

export const REGEX_EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
