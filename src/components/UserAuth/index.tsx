import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { ViewUnverified } from './components/ViewUnverified';
import { ViewVerified } from './components/ViewVerified';
import { StyledAuthContainer } from './styles';
import { PolymeshContext } from '~/context/PolymeshContext';

const UserAuth = () => {
  const { selectedAccount, identity, identityLoading } =
    useContext(AccountContext);
  const {
    state: { initialized },
  } = useContext(PolymeshContext);
  const { showAuth, setShowAuth } = useAuthContext();

  if (
    (!showAuth && !!selectedAccount) ||
    !initialized ||
    (!!selectedAccount && identityLoading)
  ) {
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
