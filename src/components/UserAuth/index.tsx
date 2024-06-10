import { useState, useEffect } from 'react';
import { useLocalStorage } from '~/hooks/utility';
import { ViewUnverified } from './components/ViewUnverified';
import { ViewVerified } from './components/ViewVerified';
import { StyledAuthContainer } from './styles';

const UserAuth = () => {
  const [showAuth, setShowAuth] = useLocalStorage('showAuth', true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setVerified(true);
  }, []);

  if (!showAuth) {
    return null;
  }

  return (
    <StyledAuthContainer>
      {verified ? (
        <ViewVerified handleDismiss={() => setShowAuth(false)} />
      ) : (
        <ViewUnverified handleVerify={() => setVerified(true)} />
      )}
    </StyledAuthContainer>
  );
};

export default UserAuth;
