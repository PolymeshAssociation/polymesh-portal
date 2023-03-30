import { useSearchParams } from 'react-router-dom';
import { Button, NotificationCounter } from '~/components/UiKit';
import {
  StyledNavBar,
  StyledNavList,
  StyledNavLink,
  StyledActionsWrapper,
} from './styles';
import { TABS } from './constants';

export const AuthorizationsNavigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const direction = searchParams.get('direction');

  return (
    <StyledNavBar>
      <StyledNavList>
        {TABS.map(({ label, searchParam }) => (
          <li key={label}>
            <StyledNavLink
              className={direction === label ? 'active' : ''}
              onClick={() => setSearchParams(searchParam)}
            >
              {label}
              <NotificationCounter count={2} />
            </StyledNavLink>
          </li>
        ))}
      </StyledNavList>
      <StyledActionsWrapper>
        <Button variant="modalPrimary">Create New Auth</Button>
      </StyledActionsWrapper>
    </StyledNavBar>
  );
};
