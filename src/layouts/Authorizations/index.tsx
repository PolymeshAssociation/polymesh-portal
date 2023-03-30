import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthorizationsNavigation } from './components/AuthorizationsNavigation';
import { AuthorizationItem } from './components/AuthorizationItem';
import { StyledAuthorizationsList } from './styles';
import { EAuthorizationDirections } from './constants';

const Authorizations = () => {
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

  return (
    <>
      <AuthorizationsNavigation />
      <StyledAuthorizationsList>
        <AuthorizationItem />
      </StyledAuthorizationsList>
    </>
  );
};

export default Authorizations;
