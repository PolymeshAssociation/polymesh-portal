import { Scope, ScopeType } from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CopyToClipboard, Icon } from '~/components';
import { Button } from '~/components/UiKit';
import { ClaimsContext } from '~/context/ClaimsContext';
import { formatDid, stringToColor } from '~/helpers/formatters';
import { ClaimItem } from '../ClaimItem';
import { EClaimsType, EClaimSortOptions } from '../../constants';
import { filterClaimsByScope } from './helpers';
import {
  StyledActionsWrapper,
  StyledIconWrapper,
  StyledScopeInfo,
  StyledScopeItem,
  StyledScopeLabel,
  StyledScopeWrapper,
  StyledSort,
  StyledSortSelect,
} from './styles';
import { useWindowWidth } from '~/hooks/utility';

interface IScopeItemProps {
  scope: Scope | null;
}

export const ScopeItem: React.FC<IScopeItemProps> = ({ scope }) => {
  const { receivedClaims, issuedClaims } = useContext(ClaimsContext);
  const [scopeExpanded, setScopeExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<EClaimSortOptions>(
    EClaimSortOptions.ISSUE_DATE,
  );
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const { isMobile, isSmallDesktop } = useWindowWidth();

  const claimTypes = {
    [EClaimsType.RECEIVED]: receivedClaims,
    [EClaimsType.ISSUED]: issuedClaims,
  };

  return (
    <StyledScopeItem>
      <StyledScopeWrapper>
        {scope ? (
          <StyledScopeInfo>
            Scope - {scope.type}
            <StyledScopeLabel>
              {scope.type === ScopeType.Ticker && (
                <StyledIconWrapper $color={stringToColor(scope.value)}>
                  <Icon name="Coins" size="12px" />
                </StyledIconWrapper>
              )}
              {scope.type === ScopeType.Identity ? (
                <>
                  {formatDid(
                    scope.value,
                    isMobile || isSmallDesktop ? 5 : 10,
                    isMobile || isSmallDesktop ? 6 : 11,
                  )}
                  <CopyToClipboard value={scope.value} />
                </>
              ) : (
                scope.value
              )}
            </StyledScopeLabel>
          </StyledScopeInfo>
        ) : (
          <StyledScopeInfo>Unscoped claims</StyledScopeInfo>
        )}
        <StyledActionsWrapper $expanded={scopeExpanded}>
          {!isMobile && (
            <StyledSort>
              Sort by:
              <StyledSortSelect>
                <select
                  onChange={({ target }) => {
                    setSortBy(target.value as EClaimSortOptions);
                  }}
                  value={sortBy}
                >
                  {Object.values(EClaimSortOptions).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Icon name="DropdownIcon" className="dropdown-icon" />
              </StyledSortSelect>
            </StyledSort>
          )}
          <Button
            variant="secondary"
            onClick={() => setScopeExpanded((prev) => !prev)}
          >
            <Icon name="ExpandIcon" size="24px" className="expand-icon" />
            Details
          </Button>
        </StyledActionsWrapper>
      </StyledScopeWrapper>
      {scopeExpanded && (
        <div>
          {isMobile && (
            <StyledSort>
              Sort by:
              <StyledSortSelect>
                <select
                  onChange={({ target }) => {
                    setSortBy(target.value as EClaimSortOptions);
                  }}
                  value={sortBy}
                >
                  {Object.values(EClaimSortOptions).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Icon name="DropdownIcon" className="dropdown-icon" />
              </StyledSortSelect>
            </StyledSort>
          )}
          {filterClaimsByScope(
            claimTypes[type as EClaimsType],
            scope,
            sortBy,
          ).map((claim, idx) => (
            <ClaimItem
              key={claim.issuer.did + idx.toString()}
              claimData={claim}
            />
          ))}
        </div>
      )}
    </StyledScopeItem>
  );
};
