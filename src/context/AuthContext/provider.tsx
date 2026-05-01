import { useMemo, useState } from 'react';
import { useLocalStorage } from '~/hooks/utility';
import {
  IdentityPopupState,
  REGEX_MOBILE_DEVICE,
  TConnectModalType,
} from './constants';
import AuthContext from './context';

interface IAuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: IAuthProviderProps) => {
  const [showAuth, setShowAuth] = useLocalStorage('showAuth', true);
  const [connectPopup, setConnectPopup] = useState<TConnectModalType | null>(
    null,
  );
  const [identityPopup, setIdentityPopup] = useState<IdentityPopupState>({
    type: null,
  });

  const isMobileDevice = REGEX_MOBILE_DEVICE.test(navigator.userAgent);

  const contextValue = useMemo(
    () => ({
      showAuth,
      connectPopup,
      identityPopup,
      isMobileDevice,
      setShowAuth,
      setConnectPopup,
      setIdentityPopup,
    }),
    [connectPopup, identityPopup, isMobileDevice, setShowAuth, showAuth],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
