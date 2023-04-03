import { useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountContext } from '~/context/AccountContext';
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
  const { identity } = useContext(AccountContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const direction = searchParams.get('direction');

  useEffect(() => {
    if (identity) return;

    setSearchParams({ direction: 'incoming' });
  }, [identity, setSearchParams]);

  return (
    <StyledNavBar>
      <StyledNavList>
        {TABS.map(({ label, searchParam }) => (
          <li key={label}>
            <StyledNavLink
              className={direction === label ? 'active' : ''}
              onClick={() => setSearchParams(searchParam)}
              disabled={label === 'outgoing' && !identity}
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
        <Button variant="modalPrimary" disabled={!identity}>
          Create New Auth
        </Button>
      </StyledActionsWrapper>
    </StyledNavBar>
  );
};
