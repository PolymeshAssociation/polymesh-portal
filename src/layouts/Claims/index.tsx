import { useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EClaimsType } from './constants';
import { ClaimsNavigation } from './components/ClaimsNavigation';
import { ClaimsContext } from '~/context/ClaimsContext';
import { ClaimPlaceholder, StyledClaimsList } from './styles';
import { ScopeItem } from './components/ScopeItem';

const Claims = () => {
  const { scopeOptions, issuedClaims } = useContext(ClaimsContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type');

  useEffect(() => {
    if (type === EClaimsType.RECEIVED || type === EClaimsType.ISSUED) return;

    setSearchParams({ type: EClaimsType.RECEIVED });
  }, [setSearchParams, type]);

  return (
    <>
      <ClaimsNavigation />
      {type === EClaimsType.RECEIVED &&
        (scopeOptions.length ? (
          <StyledClaimsList>
            {scopeOptions.map(({ scope }) =>
              scope ? <ScopeItem key={scope.value} scope={scope} /> : null,
            )}
          </StyledClaimsList>
        ) : (
          <ClaimPlaceholder>No data available</ClaimPlaceholder>
        ))}
      {type === EClaimsType.ISSUED &&
        (issuedClaims.length ? (
          <ClaimPlaceholder>Issued claims</ClaimPlaceholder>
        ) : (
          <ClaimPlaceholder>No data available</ClaimPlaceholder>
        ))}
    </>
  );
};

export default Claims;
