import { useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthorizationsNavigation } from './components/AuthorizationsNavigation';
import { AuthorizationItem } from './components/AuthorizationItem';
import { StyledAuthorizationsList, AuthorizationPlaceholder } from './styles';
import { EAuthorizationDirections } from './constants';
import { AuthorizationsContext } from '~/context/AuthorizationsContext';
import { SkeletonLoader } from '~/components/UiKit';
import { useWindowWidth } from '~/hooks/utility';

const Authorizations = () => {
  const {
    incomingAuthorizations,
    outgoingAuthorizations,
    authorizationsLoading,
  } = useContext(AuthorizationsContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const direction = searchParams.get('direction');
  const { isMobile, isTablet } = useWindowWidth();
  const isSmallScreen = isMobile || isTablet;

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
      {authorizationsLoading && (
        <SkeletonLoader height={isSmallScreen ? 312 : 162} />
      )}
      {!authorizationsLoading &&
        !notificationsCount[direction as `${EAuthorizationDirections}`] && (
          <AuthorizationPlaceholder>
            No {direction} authorizations
          </AuthorizationPlaceholder>
        )}
      {!authorizationsLoading && (
        <StyledAuthorizationsList>
          {direction === EAuthorizationDirections.INCOMING
            ? incomingAuthorizations.map((authorization) => (
                <AuthorizationItem
                  key={authorization.uuid}
                  data={authorization.toHuman()}
                  rawData={authorization}
                  accept={authorization.accept}
                  reject={authorization.remove}
                />
              ))
            : outgoingAuthorizations.map((authorization) => (
                <AuthorizationItem
                  key={authorization.uuid}
                  data={authorization.toHuman()}
                  rawData={authorization}
                  reject={authorization.remove}
                />
              ))}
        </StyledAuthorizationsList>
      )}
    </>
  );
};

export default Authorizations;
