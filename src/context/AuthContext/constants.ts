import {
  POLYMESH_WALLET,
  POLKADOT_WALLET,
  TALISMAN_WALLET,
  NOVA_WALLET,
  SUBWALLET_WALLET,
} from '~/constants/wallets';

export interface IdentityPopupState {
  type: TIdentityModalType | null;
  applicationUrl?: string;
}

export interface IAuthContext {
  showAuth: boolean;
  connectPopup: null | TConnectModalType;
  identityPopup: IdentityPopupState;
  isMobileDevice: boolean;
  setShowAuth: (showAuth: boolean) => void;
  setConnectPopup: (popup: TConnectModalType | null) => void;
  setIdentityPopup: (popup: IdentityPopupState) => void;
}

export const initialState: IAuthContext = {
  showAuth: true,
  connectPopup: null,
  identityPopup: { type: null },
  isMobileDevice: false,
  setShowAuth: () => {},
  setConnectPopup: () => {},
  setIdentityPopup: () => {},
};

export const JUMIO_IDENTITY_PROVIDER = 'jumio';
export const NETKI_IDENTITY_PROVIDER = 'netki';
export const FRACTAL_IDENTITY_PROVIDER = 'fractal';
export const FINCLUSIVE_IDENTITY_PROVIDER = 'finclusive';
export const MOCKID_IDENTITY_PROVIDER = 'mockid';
export const FINCLUSIVE_BUSINESS_IDENTITY_PROVIDER = 'finclusive-kyb';

export type TIdentityModalType =
  | 'providers'
  | typeof JUMIO_IDENTITY_PROVIDER
  | typeof NETKI_IDENTITY_PROVIDER
  | typeof FRACTAL_IDENTITY_PROVIDER
  | typeof FINCLUSIVE_IDENTITY_PROVIDER
  | typeof MOCKID_IDENTITY_PROVIDER
  | typeof FINCLUSIVE_BUSINESS_IDENTITY_PROVIDER
  | 'business'
  | 'pending';

export type TConnectModalType =
  | 'extensions'
  | 'extensionsMobile'
  | typeof POLYMESH_WALLET
  | typeof POLKADOT_WALLET
  | typeof TALISMAN_WALLET
  | typeof SUBWALLET_WALLET
  | typeof NOVA_WALLET
  | 'manual'
  | 'wallet'
  | 'browser';

export const REGEX_MOBILE_DEVICE =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
