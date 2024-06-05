import { TIcons } from '~/assets/icons/types';

import {
  POLYMESH_WALLET,
  POLKADOT_WALLET,
  TALISMAN_WALLET,
  NOVA_WALLET,
  SUBWALLET_WALLET,
  TWalletName,
} from '~/constants/wallets';

import {
  JUMIO_IDENTITY_PROVIDER,
  NETKI_IDENTITY_PROVIDER,
  FRACTAL_IDENTITY_PROVIDER,
  MOCKID_IDENTITY_PROVIDER,
} from '~/context/AuthContext/constants';

export enum EActionButtonStatus {
  ACTION_ACTIVE = 'active',
  ACTION_DISABLED = 'disabled',
  ACTION_PENDING = 'pending',
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

export type TIdentityProvider =
  | typeof JUMIO_IDENTITY_PROVIDER
  | typeof NETKI_IDENTITY_PROVIDER
  | typeof FRACTAL_IDENTITY_PROVIDER
  | typeof MOCKID_IDENTITY_PROVIDER;

export interface IIdentityProvider {
  name: string;
  link: string;
  icon: TIcons;
  requirements: string[];
  steps: string[];
}

export const IDENTITY_PROVIDER_MOCK: IIdentityProvider = {
  name: 'MockId',
  link: 'mock',
  icon: 'MockIdProviderIcon' as TIcons,
  requirements: [
    'Selecting this will assign a DID and create a CDD claim on Testnet for the selected key without identity verification.',
    'Your account will receive 100k testnet POLYX tokens.',
    'Mock CDD is for testing purposes only and is not available for mainnet.',
  ],
  steps: [],
};

export const IDENTITY_PROVIDERS: {
  [key: string]: IIdentityProvider;
} = {
  [JUMIO_IDENTITY_PROVIDER]: {
    name: 'Jumio',
    link: 'jumio',
    icon: 'JumioProviderIcon' as TIcons,
    requirements: ['Government issued ID', 'Selfie'],
    steps: [
      'Take a picture of a government issued ID front and back',
      'Take a selfie',
    ],
  },
  [NETKI_IDENTITY_PROVIDER]: {
    name: 'Netki',
    link: 'netki',
    icon: 'NetkiProviderIcon' as TIcons,
    requirements: [
      'App Download',
      'Phone number verification',
      'Government issued ID',
      'Liveliness Test',
      'Selfie',
    ],
    steps: [
      'Install MyVerify App',
      'Verity your phone number',
      'Take a picture of a government issued ID front and back',
      'Take a liveliness test',
      'Take a selfie',
    ],
  },
  [FRACTAL_IDENTITY_PROVIDER]: {
    name: 'Fractal',
    link: 'fractal',
    icon: 'FractalProviderIcon' as TIcons,
    requirements: [
      'Email verification',
      'Proof of residence',
      'Government issued ID',
      'Selfie',
    ],
    steps: [
      'Verify your Email address',
      'Take a picture of a proof of residence (e.g Bank statement, utility bill, etc.)',
      'Take a picture of a government issued ID front and back',
      'Take a selfie',
    ],
  },
};

export const REGEX_EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
