import { Icon } from '~/components';
import {
  StyledNavBar,
  StyledNavList,
  StyledNavLink,
  AddPortfolioButton,
} from './styles';

export const PortfolioNavigation = () => {
  return (
    <StyledNavBar>
      <StyledNavList>
        <li>
          <StyledNavLink />
        </li>
      </StyledNavList>
      <AddPortfolioButton>
        <Icon />
        Add Portfolio
      </AddPortfolioButton>
    </StyledNavBar>
  );
};
