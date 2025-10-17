import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '~/components';
import {
  Button,
  DropdownSelect,
  RefreshButton,
  SkeletonLoader,
} from '~/components/UiKit';
import { EButtonVariants } from '~/components/UiKit/Button/types';
import { AccountContext } from '~/context/AccountContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { useWindowWidth } from '~/hooks/utility';
import { PortfolioModal } from '../PortfolioModal';
import {
  StyledActionsWrapper,
  StyledNavBar,
  StyledNavLink,
  StyledNavList,
  StyledSelectWrapper,
} from './styles';

export const PortfolioNavigation = () => {
  const {
    identity,
    identityHasValidCdd,
    identityLoading,
    isExternalConnection,
  } = useContext(AccountContext);
  const { allPortfolios, portfolioLoading, getPortfoliosData } =
    useContext(PortfolioContext);
  const { isTransactionInProgress } = useTransactionStatusContext();
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
        <StyledSelectWrapper>
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
        </StyledSelectWrapper>
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
      <StyledActionsWrapper>
        <Button
          variant={EButtonVariants.MODAL_PRIMARY}
          round={isTablet || isMobile}
          onClick={toggleModal}
          disabled={
            !identityHasValidCdd ||
            isExternalConnection ||
            isTransactionInProgress
          }
          title="Create a new Portfolio"
        >
          <Icon name="Plus" />
          {isTablet || isMobile ? '' : 'Add Portfolio'}
        </Button>
        <RefreshButton
          onClick={getPortfoliosData}
          disabled={portfolioLoading}
        />
      </StyledActionsWrapper>

      {addExpanded && <PortfolioModal type="add" toggleModal={toggleModal} />}
    </StyledNavBar>
  );
};
