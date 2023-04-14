import { useSearchParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { PortfolioContext } from '~/context/PortfolioContext';
import { AccountContext } from '~/context/AccountContext';
import { Icon } from '~/components';
import { PortfolioModal } from '../PortfolioModal';
import {
  StyledNavBar,
  StyledNavList,
  StyledNavLink,
  AddPortfolioButton,
} from './styles';

export const PortfolioNavigation = () => {
  const { identity, identityHasValidCdd, identityLoading } =
    useContext(AccountContext);
  const { allPortfolios, portfolioLoading } = useContext(PortfolioContext);
  const [addExpanded, setAddExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');

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

  return (
    <StyledNavBar>
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
      <AddPortfolioButton onClick={toggleModal} disabled={!identityHasValidCdd}>
        <Icon name="Plus" />
        Add Portfolio
      </AddPortfolioButton>
      {addExpanded && <PortfolioModal type="add" toggleModal={toggleModal} />}
    </StyledNavBar>
  );
};
