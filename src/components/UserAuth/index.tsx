import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { ViewUnverified } from './components/ViewUnverified';
import { ViewVerified } from './components/ViewVerified';
import { StyledAuthContainer } from './styles';

const UserAuth = () => {
  const { selectedAccount, identity, identityLoading } =
    useContext(AccountContext);
  const { showAuth, setShowAuth } = useAuthContext();

  if ((!showAuth && !!selectedAccount) || identityLoading) {
    return null;
  }

  return (
    <StyledAuthContainer>
      {identity?.did ? (
        <ViewVerified handleDismiss={() => setShowAuth(false)} />
      ) : (
        <ViewUnverified />
      )}
    </StyledAuthContainer>
  );
};

export default UserAuth;
