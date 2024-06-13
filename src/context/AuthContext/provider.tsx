import { useState, useEffect, useContext, useMemo } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { EExternalIdentityStatus } from '~/context/AccountContext/constants';
import { useLocalStorage } from '~/hooks/utility';
import {
  TConnectModalType,
  TIdentityModalType,
  REGEX_MOBILE_DEVICE,
} from './constants';
import AuthContext from './context';

interface IAuthProviderProps {
  children: React.ReactNode;
}
const AuthProvider = ({ children }: IAuthProviderProps) => {
  const { externalIdentity, selectedAccount } = useContext(AccountContext);

  const [showAuth, setShowAuth] = useLocalStorage('showAuth', true);

  const [verified, setVerified] = useState(false);
  const [connectPopup, setConnectPopup] = useState<TConnectModalType | null>(
    null,
  );
  const [identityPopup, setIdentityPopup] = useState<TIdentityModalType | null>(
    null,
  );
  const [isNewWalletMobile, setIsNewWalletMobile] = useState(false);

  useEffect(() => {
    if (externalIdentity?.status === EExternalIdentityStatus.VERIFIED) {
      setVerified(true);
    } else {
      setVerified(false);
    }
  }, [externalIdentity?.status, selectedAccount]);

  const isMobileDevice = REGEX_MOBILE_DEVICE.test(navigator.userAgent);

  const contextValue = useMemo(
    () => ({
      showAuth,
      verified,
      connectPopup,
      identityPopup,
      isNewWalletMobile,
      isMobileDevice,
      setShowAuth,
      setVerified,
      setConnectPopup,
      setIdentityPopup,
      setIsNewWalletMobile,
    }),
    [
      connectPopup,
      identityPopup,
      isMobileDevice,
      isNewWalletMobile,
      setShowAuth,
      showAuth,
      verified,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
