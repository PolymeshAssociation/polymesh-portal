import { useState, useEffect, useContext, useMemo } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { EExternalIdentityStatus } from '~/context/AccountContext/constants';
import { useLocalStorage } from '~/hooks/utility';
import { TConnectModalType, TIdentityModalType } from './constants';
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

  useEffect(() => {
    if (externalIdentity?.status === EExternalIdentityStatus.VERIFIED) {
      setVerified(true);
    } else {
      setVerified(false);
    }
  }, [externalIdentity?.status, selectedAccount]);

  const contextValue = useMemo(
    () => ({
      showAuth,
      verified,
      connectPopup,
      identityPopup,
      setShowAuth,
      setVerified,
      setConnectPopup,
      setIdentityPopup,
    }),
    [connectPopup, identityPopup, setShowAuth, showAuth, verified],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
