import { useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthorizations } from '~/hooks/polymesh';
import { AuthorizationsNavigation } from './components/AuthorizationsNavigation';
import { AuthorizationItem } from './components/AuthorizationItem';
import { StyledAuthorizationsList, AuthorizationPlaceholder } from './styles';
import { EAuthorizationDirections } from './constants';
import { AccountContext } from '~/context/AccountContext';

const Authorizations = () => {
  const { identityLoading } = useContext(AccountContext);
  const {
    incomingAuthorizations,
    outgoingAuthorizations,
    authorizationsLoading,
  } = useAuthorizations();
  const [searchParams, setSearchParams] = useSearchParams();
  const direction = searchParams.get('direction');

  useEffect(() => {
    if (
      direction === EAuthorizationDirections.INCOMING ||
      direction === EAuthorizationDirections.OUTGOING
    )
      return;

    setSearchParams({ direction: EAuthorizationDirections.INCOMING });
  }, [direction, setSearchParams]);

  const notificationsCount = {
    incoming: incomingAuthorizations.length,
    outgoing: outgoingAuthorizations.length,
  };

  return (
    <>
      <AuthorizationsNavigation notificationsCount={notificationsCount} />
      {(identityLoading || authorizationsLoading) && (
        <AuthorizationPlaceholder>Loading</AuthorizationPlaceholder>
      )}
      {!identityLoading &&
        !authorizationsLoading &&
        !notificationsCount[direction as `${EAuthorizationDirections}`] && (
          <AuthorizationPlaceholder>
            No {direction} authorizations
          </AuthorizationPlaceholder>
        )}
      {!identityLoading && !authorizationsLoading && (
        <StyledAuthorizationsList>
          {direction === EAuthorizationDirections.INCOMING
            ? incomingAuthorizations.map((authorization) => (
                <AuthorizationItem
                  key={authorization.uuid}
                  data={authorization.toHuman()}
                  accept={authorization.accept}
                  reject={authorization.remove}
                />
              ))
            : outgoingAuthorizations.map((authorization) => (
                <AuthorizationItem
                  key={authorization.uuid}
                  data={authorization.toHuman()}
                  reject={authorization.remove}
                />
              ))}
        </StyledAuthorizationsList>
      )}
    </>
  );
};

export default Authorizations;