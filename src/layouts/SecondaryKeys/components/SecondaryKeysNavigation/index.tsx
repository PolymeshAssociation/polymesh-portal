import { useSearchParams } from 'react-router-dom';
import {
  StyledNavWrapper,
  StyledNav,
  StyledNavItem,
  StyledBadge,
} from './styles';
import { navigationItems } from './constants';
import { ESecondaryKeyTabs } from '../../constants';

interface ISecondaryKeysNavigationProps {
  notificationsCount: {
    active: number;
  };
}

export const SecondaryKeysNavigation = ({
  notificationsCount,
}: ISecondaryKeysNavigationProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || ESecondaryKeyTabs.ACTIVE;

  const handleTabChange = (tab: ESecondaryKeyTabs) => {
    setSearchParams({ tab });
  };

  return (
    <StyledNavWrapper>
      <StyledNav>
        {navigationItems.map(({ label, route }) => (
          <StyledNavItem
            key={route}
            $isActive={currentTab === route}
            onClick={() => handleTabChange(route)}
          >
            {label}
            {!!notificationsCount[route] && (
              <StyledBadge>{notificationsCount[route]}</StyledBadge>
            )}
          </StyledNavItem>
        ))}
      </StyledNav>
    </StyledNavWrapper>
  );
};
