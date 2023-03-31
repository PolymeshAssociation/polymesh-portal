import { useSearchParams } from 'react-router-dom';
import { Button, NotificationCounter } from '~/components/UiKit';
import {
  StyledNavBar,
  StyledNavList,
  StyledNavLink,
  StyledActionsWrapper,
} from './styles';
import { TABS } from './constants';

interface IAuthorizationsNavigationProps {
  notificationsCount: {
    incoming: number;
    outgoing: number;
  };
}

export const AuthorizationsNavigation: React.FC<
  IAuthorizationsNavigationProps
> = ({ notificationsCount }) => {
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
              {!!notificationsCount[label] && (
                <NotificationCounter count={notificationsCount[label]} />
              )}
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
