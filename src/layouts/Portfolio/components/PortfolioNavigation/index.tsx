import { useSearchParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { PortfolioContext } from '~/context/PortfolioContext';
import { AccountContext } from '~/context/AccountContext';
import { Icon } from '~/components';
import { PortfolioModal } from '../PortfolioModal';
import {
  StyledNavBar,
  StyledMobileNavigation,
  StyledNavList,
  StyledNavLink,
  AddPortfolioButton,
  AddPortfolioMobile,
} from './styles';
import { useWindowWidth } from '~/hooks/utility';
import { DropdownSelect, SkeletonLoader } from '~/components/UiKit';

export const PortfolioNavigation = () => {
  const { identity, identityHasValidCdd, identityLoading } =
    useContext(AccountContext);
  const { allPortfolios, portfolioLoading } = useContext(PortfolioContext);
  const [addExpanded, setAddExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const { isMobile, isTablet } = useWindowWidth();

  useEffect(() => {
    if (identityLoading || portfolioLoading) return;

    if (
      !identity ||
      (!portfolioLoading && !allPortfolios.length) ||
      !allPortfolios.find(({ id }) => id === portfolioId)
    ) {
      setSearchParams({});
    }
  }, [
    identity,
    identityLoading,
    allPortfolios,
    portfolioId,
    portfolioLoading,
    setSearchParams,
  ]);

  const toggleModal = () => setAddExpanded((prev) => !prev);

  const renderNavLinks = () => {
    if (isMobile)
      return (
        <StyledMobileNavigation>
          <AddPortfolioMobile
            onClick={toggleModal}
            disabled={!identityHasValidCdd}
          >
            <Icon name="Plus" />
          </AddPortfolioMobile>
          {portfolioLoading ? (
            <SkeletonLoader height="36px" />
          ) : (
            <DropdownSelect
              options={['All assets', ...allPortfolios.map(({ name }) => name)]}
              selected={
                allPortfolios.find(({ id }) => id === portfolioId)?.name ||
                'All assets'
              }
              error={undefined}
              placeholder="Portfolio"
              onChange={(portfolioName) => {
                if (portfolioName === 'All assets') {
                  setSearchParams({});
                  return;
                }
                const selected = allPortfolios.find(
                  ({ name }) => name === portfolioName,
                );
                if (selected) {
                  setSearchParams({ id: selected.id as string });
                } else {
                  setSearchParams({});
                }
              }}
              borderRadius={24}
            />
          )}
        </StyledMobileNavigation>
      );

    return portfolioLoading ? (
      <SkeletonLoader height={48} width={220} />
    ) : (
      <StyledNavList>
        <li>
          <StyledNavLink
            className={portfolioId ? '' : 'active'}
            onClick={() => setSearchParams({})}
          >
            All assets
          </StyledNavLink>
        </li>
        {allPortfolios.map(({ id, name }) => (
          <li key={id}>
            <StyledNavLink
              className={portfolioId === id ? 'active' : ''}
              onClick={() => setSearchParams({ id: id as string })}
            >
              {name}
            </StyledNavLink>
          </li>
        ))}
      </StyledNavList>
    );
  };

  return (
    <StyledNavBar>
      {renderNavLinks()}
      {!isMobile && (
        <AddPortfolioButton
          onClick={toggleModal}
          disabled={!identityHasValidCdd}
        >
          <Icon name="Plus" />
          {!isTablet && 'Add Portfolio'}
        </AddPortfolioButton>
      )}
      {addExpanded && <PortfolioModal type="add" toggleModal={toggleModal} />}
    </StyledNavBar>
  );
};
