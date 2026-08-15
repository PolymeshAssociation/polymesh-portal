import { useMemo, useState } from 'react';
import { useLocalStorage } from '~/hooks/utility';
import { REGEX_MOBILE_DEVICE, TConnectModalType } from './constants';
import AuthContext from './context';

interface IAuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: IAuthProviderProps) => {
  const [showAuth, setShowAuth] = useLocalStorage('showAuth', true);
  const [connectPopup, setConnectPopup] = useState<TConnectModalType | null>(
    null,
  );
  const [showIdentityPopup, setShowIdentityPopup] = useState(false);

  const isMobileDevice = REGEX_MOBILE_DEVICE.test(navigator.userAgent);

  const contextValue = useMemo(
    () => ({
      showAuth,
      connectPopup,
      showIdentityPopup,
      isMobileDevice,
      setShowAuth,
      setConnectPopup,
      setShowIdentityPopup,
    }),
    [connectPopup, isMobileDevice, setShowAuth, showAuth, showIdentityPopup],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
