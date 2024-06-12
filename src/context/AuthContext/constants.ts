import {
  POLYMESH_WALLET,
  POLKADOT_WALLET,
  TALISMAN_WALLET,
  NOVA_WALLET,
  SUBWALLET_WALLET,
} from '~/constants/wallets';

export interface IAuthContext {
  showAuth: boolean;
  verified: boolean;
  connectPopup: null | TConnectModalType;
  identityPopup: null | TIdentityModalType;
  setShowAuth: (showAuth: boolean) => void;
  setVerified: (verified: boolean) => void;
  setConnectPopup: (popup: TConnectModalType | null) => void;
  setIdentityPopup: (popup: TIdentityModalType | null) => void;
}

export const initialState: IAuthContext = {
  showAuth: true,
  verified: false,
  connectPopup: null,
  identityPopup: null,
  setShowAuth: () => {},
  setVerified: () => {},
  setConnectPopup: () => {},
  setIdentityPopup: () => {},
};

export const JUMIO_IDENTITY_PROVIDER = 'Jumio';
export const NETKI_IDENTITY_PROVIDER = 'Netki';
export const FRACTAL_IDENTITY_PROVIDER = 'Fractal';
export const MOCKID_IDENTITY_PROVIDER = 'MockID';

export type TIdentityModalType =
  | 'providers'
  | typeof JUMIO_IDENTITY_PROVIDER
  | typeof NETKI_IDENTITY_PROVIDER
  | typeof FRACTAL_IDENTITY_PROVIDER
  | typeof MOCKID_IDENTITY_PROVIDER
  | 'business'
  | 'pending';

export type TConnectModalType =
  | 'extensions'
  | typeof POLYMESH_WALLET
  | typeof POLKADOT_WALLET
  | typeof TALISMAN_WALLET
  | typeof SUBWALLET_WALLET
  | typeof NOVA_WALLET
  | 'manual'
  | 'wallet'
  | 'browser';
