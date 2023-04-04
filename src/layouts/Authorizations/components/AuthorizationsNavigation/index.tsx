import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountContext } from '~/context/AccountContext';
import { AddNewAuth } from '../AddNewAuth';
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
  const [addNewAuthExpanded, setAddNewAuthExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const direction = searchParams.get('direction');

  useEffect(() => {
    if (identity) return;

    setSearchParams({ direction: 'incoming' });
  }, [identity, setSearchParams]);

  const toggleModal = () => setAddNewAuthExpanded((prev) => !prev);

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
        <Button
          variant="modalPrimary"
          disabled={!identity}
          onClick={toggleModal}
        >
          Create New Auth
        </Button>
      </StyledActionsWrapper>
      {addNewAuthExpanded && <AddNewAuth toggleModal={toggleModal} />}
    </StyledNavBar>
  );
};
