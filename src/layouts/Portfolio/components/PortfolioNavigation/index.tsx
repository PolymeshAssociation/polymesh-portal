import { useContext, useEffect, useMemo, useState } from 'react';
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
import { formatKey } from '~/helpers/formatters';
import { useWindowWidth } from '~/hooks/utility';
import {
  buildBalanceSearchParams,
  EBalanceHolder,
  getBalanceHolder,
} from '../../helpers';
import { PortfolioModal } from '../PortfolioModal';
import {
  StyledActionsWrapper,
  StyledNavBar,
  StyledNavLink,
  StyledNavList,
  StyledNavWrapper,
  StyledSelectWrapper,
  StyledSubSelectorWrapper,
} from './styles';

export const PortfolioNavigation = () => {
  const {
    identity,
    canUseIdentityFeatures,
    identityLoading,
    isExternalConnection,
    account,
    allKeyInfo,
    primaryKey,
    allAccountsWithMeta,
  } = useContext(AccountContext);
  const { allPortfolios, portfolioLoading, getPortfoliosData } =
    useContext(PortfolioContext);
  const { isTransactionInProgress } = useTransactionStatusContext();
  const [addExpanded, setAddExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const holder = searchParams.get('holder');
  const address = searchParams.get('address');
  const selectedHolder = getBalanceHolder(holder, portfolioId);
  const { isMobile, isTablet } = useWindowWidth();
  const isDesktop = !isMobile && !isTablet;

  useEffect(() => {
    if (identityLoading || portfolioLoading) {
      return;
    }

    if (!identity) {
      setSearchParams({});
      return;
    }

    if (selectedHolder === EBalanceHolder.ACCOUNT) {
      if (!address || !allKeyInfo.find(({ key }) => key === address)) {
        setSearchParams(
          buildBalanceSearchParams({
            holder: EBalanceHolder.ACCOUNT,
            accountAddress: account?.address || undefined,
          }),
        );
      }
      return;
    }

    if (selectedHolder !== EBalanceHolder.PORTFOLIO) {
      return;
    }

    if (!portfolioId || !allPortfolios.find(({ id }) => id === portfolioId)) {
      setSearchParams(buildBalanceSearchParams({ holder: EBalanceHolder.ALL }));
    }
  }, [
    identity,
    identityLoading,
    allPortfolios,
    allKeyInfo,
    selectedHolder,
    portfolioId,
    address,
    portfolioLoading,
    setSearchParams,
    account,
  ]);

  const getAccountLabel = (keyAddress: string): string => {
    const walletName = allAccountsWithMeta.find(
      ({ address: a }) => a === keyAddress,
    )?.meta.name;
    const nameOrKey = walletName || formatKey(keyAddress, 6, 6);
    return nameOrKey;
  };

  const orderedAccounts = useMemo(() => {
    const primary = allKeyInfo.find(({ key }) => key === primaryKey);
    const secondaries = allKeyInfo.filter(({ key }) => key !== primaryKey);
    return primary ? [primary, ...secondaries] : allKeyInfo;
  }, [allKeyInfo, primaryKey]);

  const handleCategoryChange = (category: string | null) => {
    if (category === 'All balances') {
      setSearchParams(buildBalanceSearchParams({ holder: EBalanceHolder.ALL }));
    } else if (category === 'Accounts') {
      const targetAddress = account?.address || orderedAccounts[0]?.key;
      if (targetAddress) {
        setSearchParams(
          buildBalanceSearchParams({
            holder: EBalanceHolder.ACCOUNT,
            accountAddress: targetAddress,
          }),
        );
      }
    } else if (category === 'Portfolios') {
      const firstPortfolio = allPortfolios[0];
      if (firstPortfolio) {
        setSearchParams(
          buildBalanceSearchParams({
            holder: EBalanceHolder.PORTFOLIO,
            portfolioId: firstPortfolio.id,
          }),
        );
      }
    }
  };

  const getCategoryLabel = (): string => {
    if (selectedHolder === EBalanceHolder.ACCOUNT) return 'Accounts';
    if (selectedHolder === EBalanceHolder.PORTFOLIO) return 'Portfolios';
    return 'All balances';
  };

  const renderSubSelector = () => {
    if (selectedHolder === EBalanceHolder.ACCOUNT) {
      return (
        <StyledSubSelectorWrapper>
          <DropdownSelect
            options={orderedAccounts.map(({ key }) => getAccountLabel(key))}
            selected={address ? getAccountLabel(address) : ''}
            error={undefined}
            placeholder="Select account"
            onChange={(selection) => {
              const found = orderedAccounts.find(
                ({ key }) => getAccountLabel(key) === selection,
              );
              if (found) {
                setSearchParams(
                  buildBalanceSearchParams({
                    holder: EBalanceHolder.ACCOUNT,
                    accountAddress: found.key,
                  }),
                );
              }
            }}
          />
        </StyledSubSelectorWrapper>
      );
    }

    if (selectedHolder === EBalanceHolder.PORTFOLIO) {
      return (
        <StyledSubSelectorWrapper>
          <DropdownSelect
            options={allPortfolios.map(({ name }) => name)}
            selected={
              allPortfolios.find(({ id }) => id === portfolioId)?.name ?? ''
            }
            error={undefined}
            placeholder="Select portfolio"
            onChange={(selection) => {
              const found = allPortfolios.find(
                ({ name }) => name === selection,
              );
              if (found) {
                setSearchParams(
                  buildBalanceSearchParams({
                    holder: EBalanceHolder.PORTFOLIO,
                    portfolioId: found.id,
                  }),
                );
              }
            }}
          />
        </StyledSubSelectorWrapper>
      );
    }

    return null;
  };

  const renderNavLinks = () => {
    if (!isDesktop) {
      return (
        <StyledSelectWrapper>
          {portfolioLoading ? (
            <SkeletonLoader height="36px" />
          ) : (
            <>
              <DropdownSelect
                options={['All balances', 'Accounts', 'Portfolios']}
                selected={getCategoryLabel()}
                error={undefined}
                placeholder="Balance view"
                onChange={handleCategoryChange}
              />
              {(selectedHolder === EBalanceHolder.ACCOUNT ||
                selectedHolder === EBalanceHolder.PORTFOLIO) &&
                renderSubSelector()}
            </>
          )}
        </StyledSelectWrapper>
      );
    }

    return (
      <StyledNavWrapper>
        {portfolioLoading ? (
          <SkeletonLoader height={48} width={340} />
        ) : (
          <>
            <StyledNavList>
              <li>
                <StyledNavLink
                  className={
                    selectedHolder === EBalanceHolder.ALL ? 'active' : ''
                  }
                  onClick={() =>
                    setSearchParams(
                      buildBalanceSearchParams({ holder: EBalanceHolder.ALL }),
                    )
                  }
                >
                  All balances
                </StyledNavLink>
              </li>
              <li>
                <StyledNavLink
                  className={
                    selectedHolder === EBalanceHolder.ACCOUNT ? 'active' : ''
                  }
                  onClick={() => handleCategoryChange('Accounts')}
                >
                  Accounts
                </StyledNavLink>
              </li>
              <li>
                <StyledNavLink
                  className={
                    selectedHolder === EBalanceHolder.PORTFOLIO ? 'active' : ''
                  }
                  onClick={() => handleCategoryChange('Portfolios')}
                >
                  Portfolios
                </StyledNavLink>
              </li>
            </StyledNavList>
            {renderSubSelector()}
          </>
        )}
      </StyledNavWrapper>
    );
  };

  const toggleModal = () => setAddExpanded((prev) => !prev);

  return (
    <StyledNavBar>
      {renderNavLinks()}
      <StyledActionsWrapper>
        <Button
          variant={EButtonVariants.MODAL_PRIMARY}
          round={isTablet || isMobile}
          onClick={toggleModal}
          disabled={
            !canUseIdentityFeatures ||
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
