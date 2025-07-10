import { ScopeType } from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CopyToClipboard, Icon } from '~/components';
import { AssetDetailsModal } from '~/components/AssetDetailsModal';
import { Button } from '~/components/UiKit';
import { ClaimsContext } from '~/context/ClaimsContext';
import { ScopeItem as ScopeItemType } from '~/context/ClaimsContext/constants';
import { formatDid, stringToColor } from '~/helpers/formatters';
import { useWindowWidth } from '~/hooks/utility';
import { EClaimSortOptions, EClaimsType } from '../../constants';
import { ClaimItem } from '../ClaimItem';
import { filterClaimsByScope } from './helpers';
import {
  StyledActionsWrapper,
  StyledClickableWrapper,
  StyledIconWrapper,
  StyledScopeInfo,
  StyledScopeItem,
  StyledScopeLabel,
  StyledScopeWrapper,
  StyledSort,
  StyledSortSelect,
} from './styles';

interface IScopeItemProps {
  scopeItem: ScopeItemType;
}

export const ScopeItem: React.FC<IScopeItemProps> = ({ scopeItem }) => {
  const { receivedClaims, issuedClaims } = useContext(ClaimsContext);
  const [scopeExpanded, setScopeExpanded] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
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

  const toggleModal = () => {
    setModalOpen(false);
  };

  const { scope } = scopeItem;

  return (
    <StyledScopeItem>
      <StyledScopeWrapper>
        {(() => {
          if (scope) {
            return (
              <StyledScopeInfo>
                Scope - {scope.type}
                <StyledScopeLabel>
                  {scope.type === ScopeType.Asset && (
                    <>
                      <StyledClickableWrapper
                        onClick={() => setModalOpen(true)}
                      >
                        <StyledIconWrapper $color={stringToColor(scope.value)}>
                          <Icon name="Coins" size="12px" />
                        </StyledIconWrapper>
                        {scope.value}
                      </StyledClickableWrapper>
                      <CopyToClipboard value={scope.value} />
                      {isModalOpen && (
                        <AssetDetailsModal
                          asset={scope.value}
                          toggleModal={toggleModal}
                        />
                      )}
                    </>
                  )}
                  {scope.type === ScopeType.Identity && (
                    <>
                      {formatDid(
                        scope.value,
                        isMobile || isSmallDesktop ? 5 : 10,
                        isMobile || isSmallDesktop ? 6 : 11,
                      )}
                      <CopyToClipboard value={scope.value} />
                    </>
                  )}
                  {scope.type !== ScopeType.Asset &&
                    scope.type !== ScopeType.Identity &&
                    scope.value}
                </StyledScopeLabel>
              </StyledScopeInfo>
            );
          }

          return <StyledScopeInfo>Unscoped claims</StyledScopeInfo>;
        })()}
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
                    <option className="options" key={option} value={option}>
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
                    <option className="options" key={option} value={option}>
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
            scopeItem,
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
