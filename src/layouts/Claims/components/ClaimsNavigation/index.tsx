import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EClaimsType, EScopeSortOptions } from '../../constants';
import {
  Button,
  DropdownSelect,
  RefreshButton,
  SkeletonLoader,
} from '~/components/UiKit';
import { Icon } from '~/components';
import {
  StyledActionsWrapper,
  StyledNavBar,
  StyledNavLink,
  StyledNavList,
  StyledSort,
  StyledSortSelect,
} from './styles';
import { CreateNewClaim } from '../CreateNewClaim';
import { ClaimsContext } from '~/context/ClaimsContext';
import { useWindowWidth } from '~/hooks/utility';
import { AccountContext } from '~/context/AccountContext';

interface IClaimsNavigationProps {
  sortBy: EScopeSortOptions;
  setSortBy: React.Dispatch<React.SetStateAction<EScopeSortOptions>>;
}

export const ClaimsNavigation: React.FC<IClaimsNavigationProps> = ({
  sortBy,
  setSortBy,
}) => {
  const { identity, isExternalConnection } = useContext(AccountContext);
  const { refreshClaims, claimsLoading } = useContext(ClaimsContext);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const claimType = searchParams.get('type');
  const { isMobile, isTablet } = useWindowWidth();
  const isSmallScreen = isMobile || isTablet;

  const toggleModal = () => setCreateModalOpen((prev) => !prev);

  return (
    <>
      <StyledNavBar>
        {isMobile ? (
          <div>
            {claimsLoading ? (
              <SkeletonLoader height={36} />
            ) : (
              <DropdownSelect
                options={Object.values(EClaimsType)}
                onChange={(type) => type && setSearchParams({ type })}
                selected={claimType || undefined}
                placeholder={claimType || ''}
                borderRadius={24}
                error={undefined}
              />
            )}
          </div>
        ) : (
          <StyledNavList>
            {Object.values(EClaimsType).map((type) => (
              <StyledNavLink
                key={type}
                className={type === claimType ? 'active' : ''}
                onClick={() => setSearchParams({ type })}
              >
                {claimsLoading ? <SkeletonLoader width={64} /> : type}
              </StyledNavLink>
            ))}
          </StyledNavList>
        )}
        <StyledActionsWrapper>
          {!isMobile && (
            <StyledSort>
              {claimsLoading ? (
                <div>
                  <SkeletonLoader height={20} width={isTablet ? 112 : 168} />
                </div>
              ) : (
                <>
                  Sort by:
                  <StyledSortSelect>
                    <select
                      onChange={({ target }) => {
                        setSortBy(target.value as EScopeSortOptions);
                      }}
                      value={sortBy}
                    >
                      {Object.values(EScopeSortOptions).map((option) => (
                        <option className="options" key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <Icon name="DropdownIcon" className="dropdown-icon" />
                  </StyledSortSelect>
                </>
              )}
            </StyledSort>
          )}
          <Button
            variant="modalPrimary"
            onClick={toggleModal}
            round={isSmallScreen}
            disabled={!identity || isExternalConnection}
          >
            <Icon name="Plus" />
            {!isSmallScreen && 'Create New Claim'}
          </Button>
          <RefreshButton onClick={refreshClaims} disabled={claimsLoading} />
        </StyledActionsWrapper>
        {createModalOpen && <CreateNewClaim toggleModal={toggleModal} />}
      </StyledNavBar>
      {isMobile && (
        <StyledSort>
          {claimsLoading ? (
            <SkeletonLoader height={20} width={160} />
          ) : (
            <>
              Sort by:
              <StyledSortSelect>
                <select
                  onChange={({ target }) => {
                    setSortBy(target.value as EScopeSortOptions);
                  }}
                  value={sortBy}
                >
                  {Object.values(EScopeSortOptions).map((option) => (
                    <option className="options" key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Icon name="DropdownIcon" className="dropdown-icon" />
              </StyledSortSelect>
            </>
          )}
        </StyledSort>
      )}
    </>
  );
};
