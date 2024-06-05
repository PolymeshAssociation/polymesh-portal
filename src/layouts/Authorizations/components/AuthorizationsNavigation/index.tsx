import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountContext } from '~/context/AccountContext';
import { AddNewAuth } from '../AddNewAuth';
import {
  Button,
  DropdownSelect,
  NotificationCounter,
  RefreshButton,
  SkeletonLoader,
} from '~/components/UiKit';
import {
  StyledNavBar,
  StyledNavList,
  StyledNavLink,
  StyledActionsWrapper,
  StyledSelectWrapper,
} from './styles';
import { TABS } from './constants';
import { Icon } from '~/components';
import { AuthorizationsContext } from '~/context/AuthorizationsContext';
import { useWindowWidth } from '~/hooks/utility';
import { EAuthorizationDirections } from '../../constants';

interface IAuthorizationsNavigationProps {
  notificationsCount: {
    incoming: number;
    outgoing: number;
  };
}

export const AuthorizationsNavigation: React.FC<
  IAuthorizationsNavigationProps
> = ({ notificationsCount }) => {
  const { identity, isExternalConnection } = useContext(AccountContext);
  const { refreshAuthorizations, authorizationsLoading } = useContext(
    AuthorizationsContext,
  );
  const [addNewAuthExpanded, setAddNewAuthExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const direction = searchParams.get('direction');
  const { isMobile, isTablet } = useWindowWidth();

  const isSmallScreen = isMobile || isTablet;

  useEffect(() => {
    if (identity) return;

    setSearchParams({ direction: 'incoming' });
  }, [identity, setSearchParams]);

  const toggleModal = () => setAddNewAuthExpanded((prev) => !prev);

  return (
    <StyledNavBar>
      {isMobile ? (
        <StyledSelectWrapper>
          {authorizationsLoading ? (
            <SkeletonLoader height={36} />
          ) : (
            <>
              <DropdownSelect
                options={TABS.map(({ label }) => label)}
                onChange={(option) => {
                  const tab = TABS.find(({ label }) => label === option);
                  if (tab) {
                    setSearchParams(tab.searchParam);
                  }
                }}
                selected={direction || undefined}
                borderRadius={24}
                error={undefined}
                placeholder={direction || ''}
              />
              {!!notificationsCount[direction as EAuthorizationDirections] && (
                <NotificationCounter
                  className="notification-counter"
                  count={
                    notificationsCount[direction as EAuthorizationDirections]
                  }
                />
              )}
            </>
          )}
        </StyledSelectWrapper>
      ) : (
        <StyledNavList>
          {TABS.map(({ label, searchParam }) => (
            <li key={label}>
              <StyledNavLink
                className={
                  !authorizationsLoading && direction === label ? 'active' : ''
                }
                onClick={() => setSearchParams(searchParam)}
                disabled={label === 'outgoing' && !identity}
              >
                {authorizationsLoading ? (
                  <SkeletonLoader width={96} />
                ) : (
                  <>
                    {label}
                    {!!notificationsCount[label] && (
                      <NotificationCounter count={notificationsCount[label]} />
                    )}
                  </>
                )}
              </StyledNavLink>
            </li>
          ))}
        </StyledNavList>
      )}
      <StyledActionsWrapper>
        <Button
          variant="modalPrimary"
          disabled={!identity || isExternalConnection}
          onClick={toggleModal}
          round={isSmallScreen}
        >
          <Icon name="Plus" />
          {!isSmallScreen && 'Create New Auth'}
        </Button>
        <RefreshButton
          onClick={refreshAuthorizations}
          disabled={authorizationsLoading}
        />
      </StyledActionsWrapper>
      {addNewAuthExpanded && <AddNewAuth toggleModal={toggleModal} />}
    </StyledNavBar>
  );
};
