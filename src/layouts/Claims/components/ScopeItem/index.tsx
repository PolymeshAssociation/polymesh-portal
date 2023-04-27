import { Scope } from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '~/components';
import { Button } from '~/components/UiKit';
import { ClaimsContext } from '~/context/ClaimsContext';
import { stringToColor } from '~/helpers/formatters';
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
              {scope.type === 'Ticker' && (
                <StyledIconWrapper color={stringToColor(scope.value)}>
                  <Icon name="Coins" size="12px" />
                </StyledIconWrapper>
              )}
              {scope.value}
            </StyledScopeLabel>
          </StyledScopeInfo>
        ) : (
          <StyledScopeInfo>Unscoped claims</StyledScopeInfo>
        )}
        <StyledActionsWrapper expanded={scopeExpanded}>
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
