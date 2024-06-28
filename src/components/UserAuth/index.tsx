import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { ViewUnverified } from './components/ViewUnverified';
import { ViewVerified } from './components/ViewVerified';
import { StyledAuthContainer } from './styles';

const UserAuth = () => {
  const { selectedAccount } = useContext(AccountContext);
  const { showAuth, setShowAuth, verified } = useAuthContext();

  if (!showAuth && !!selectedAccount) {
    return null;
  }

  return (
    <StyledAuthContainer>
      {verified ? (
        <ViewVerified handleDismiss={() => setShowAuth(false)} />
      ) : (
        <ViewUnverified />
      )}
    </StyledAuthContainer>
  );
};

export default UserAuth;
