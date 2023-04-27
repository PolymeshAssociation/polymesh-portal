import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EClaimsType, EScopeSortOptions } from './constants';
import { ClaimsNavigation } from './components/ClaimsNavigation';
import { ClaimsContext } from '~/context/ClaimsContext';
import { ClaimPlaceholder, StyledClaimsList } from './styles';
import { ScopeItem } from './components/ScopeItem';
import { sortScopesBySortOption } from './helpers';

const Claims = () => {
  const { receivedScopes, issuedScopes, claimsLoading } =
    useContext(ClaimsContext);
  const [sortBy, setSortBy] = useState<EScopeSortOptions>(
    EScopeSortOptions.TICKER,
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type');

  useEffect(() => {
    if (type === EClaimsType.RECEIVED || type === EClaimsType.ISSUED) return;

    setSearchParams({ type: EClaimsType.RECEIVED });
  }, [setSearchParams, type]);

  const scopeTypes = {
    [EClaimsType.RECEIVED]: receivedScopes,
    [EClaimsType.ISSUED]: issuedScopes,
  };

  return (
    <>
      <ClaimsNavigation sortBy={sortBy} setSortBy={setSortBy} />
      {claimsLoading ? (
        <ClaimPlaceholder>Loading</ClaimPlaceholder>
      ) : (
        <>
          {!scopeTypes[type as EClaimsType].length && (
            <ClaimPlaceholder>No data available</ClaimPlaceholder>
          )}
          <StyledClaimsList>
            {sortScopesBySortOption(
              scopeTypes[type as EClaimsType],
              sortBy,
            ).map(({ scope }, idx) => (
              <ScopeItem
                key={(scope?.value || 'unscoped') + idx.toString()}
                scope={scope}
              />
            ))}
          </StyledClaimsList>
        </>
      )}
    </>
  );
};

export default Claims;
