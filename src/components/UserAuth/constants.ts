import { TIcons } from '~/assets/icons/types';

import {
  POLYMESH_WALLET,
  POLKADOT_WALLET,
  TALISMAN_WALLET,
  NOVA_WALLET,
  SUBWALLET_WALLET,
  TWalletName,
} from '~/constants/wallets';

export enum EActionButtonStatus {
  ACTION_ACTIVE = 'active',
  ACTION_DISABLED = 'disabled',
  ACTION_PENDING = 'pending',
  ACTION_DONE = 'done',
}

export type TAuthModalType = 'connect' | 'identify' | null;

export type TConnectModalType =
  | 'extensions'
  | typeof POLYMESH_WALLET
  | typeof POLKADOT_WALLET
  | typeof TALISMAN_WALLET
  | typeof SUBWALLET_WALLET
  | typeof NOVA_WALLET
  | 'manual'
  | 'wallet';

export const JUMIO_IDENTITY_PROVIDER = 'Jumio';
export const NETKI_IDENTITY_PROVIDER = 'Netki';
export const FRACTAL_IDENTITY_PROVIDER = 'Fractal';

export type TIdentityModalType =
  | 'providers'
  | typeof JUMIO_IDENTITY_PROVIDER
  | typeof NETKI_IDENTITY_PROVIDER
  | typeof FRACTAL_IDENTITY_PROVIDER
  | 'business';

export const WALLET_FEATURES_LIST = {
  [POLYMESH_WALLET as TWalletName]: [
    'Most convenient',
    'Browser support: Google Chrome',
  ],
  [POLKADOT_WALLET as TWalletName]: [
    'Multichain support',
    'Browser support: Google Chrome, Firefox',
  ],
  [SUBWALLET_WALLET as TWalletName]: [
    'Multichain support',
    'Browser support: Google Chrome, Firefox, Brave and Edge',
    'Mobile App',
  ],
  [TALISMAN_WALLET as TWalletName]: [
    'Multichain support',
    'Browser support: Google Chrome',
  ],
};

export type TIdentityProviderNames =
  | typeof JUMIO_IDENTITY_PROVIDER
  | typeof NETKI_IDENTITY_PROVIDER
  | typeof FRACTAL_IDENTITY_PROVIDER;

export interface IIdentityProvider {
  name: TIdentityProviderNames;
  link: string;
  icon: TIcons;
  requirements: string[];
  steps: string[];
}

export const IDENTITY_PROVIDERS: {
  [key: string]: IIdentityProvider;
} = {
  [JUMIO_IDENTITY_PROVIDER]: {
    name: JUMIO_IDENTITY_PROVIDER,
    link: 'jumio',
    icon: 'JumioProviderIcon' as TIcons,
    requirements: ['Government issued ID', 'Selfie'],
    steps: [
      'Take a picture of a government issued ID front and back',
      'Take a selfie',
    ],
  },
  [NETKI_IDENTITY_PROVIDER]: {
    name: NETKI_IDENTITY_PROVIDER,
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
    name: FRACTAL_IDENTITY_PROVIDER,
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
