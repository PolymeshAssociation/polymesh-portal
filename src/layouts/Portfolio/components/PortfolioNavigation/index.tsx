import { useSearchParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { PortfolioContext } from '~/context/PortfolioContext';
import { Icon } from '~/components';
import { PortfolioModal } from '../PortfolioModal';
import {
  StyledNavBar,
  StyledNavList,
  StyledNavLink,
  AddPortfolioButton,
} from './styles';

export const PortfolioNavigation: React.FC<IPortfolioNavigationProps> = () => {
  const { allPortfolios, portfolioLoading } = useContext(PortfolioContext);
  const [addExpanded, setAddExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');

  useEffect(() => {
    if (portfolioLoading) return;

    if (
      (!portfolioLoading && !allPortfolios.length) ||
      !allPortfolios.find(({ id }) => id === portfolioId)
    ) {
      setSearchParams({});
    }
  }, [allPortfolios, portfolioId, portfolioLoading, setSearchParams]);

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
        {allPortfolios.map(({ id }) => (
          <li key={id}>
            <StyledNavLink
              className={portfolioId === id ? 'active' : ''}
              onClick={() => setSearchParams({ id })}
            >
              {id}
            </StyledNavLink>
          </li>
        ))}
      </StyledNavList>
      <AddPortfolioButton onClick={toggleModal}>
        <Icon name="Plus" />
        Add Portfolio
      </AddPortfolioButton>
      {addExpanded && <PortfolioModal type="add" toggleModal={toggleModal} />}
    </StyledNavBar>
  );
};
