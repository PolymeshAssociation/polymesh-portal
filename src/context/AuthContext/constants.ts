import {
  NOVA_WALLET,
  POLKADOT_WALLET,
  POLYMESH_WALLET,
  SUBWALLET_WALLET,
  TALISMAN_WALLET,
} from '~/constants/wallets';

export interface IAuthContext {
  showAuth: boolean;
  connectPopup: null | TConnectModalType;
  showIdentityPopup: boolean;
  isMobileDevice: boolean;
  setShowAuth: (showAuth: boolean) => void;
  setConnectPopup: (popup: TConnectModalType | null) => void;
  setShowIdentityPopup: (show: boolean) => void;
}

export const initialState: IAuthContext = {
  showAuth: true,
  connectPopup: null,
  showIdentityPopup: false,
  isMobileDevice: false,
  setShowAuth: () => {},
  setConnectPopup: () => {},
  setShowIdentityPopup: () => {},
};

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
