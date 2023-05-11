import { useEffect, useState } from 'react';
import { useNetwork, useNotifications } from '~/hooks/polymesh';
import { Icon } from '~/components';
import { NotificationCounter } from '../UiKit';
import {
  StyledSidebar,
  MenuButton,
  StyledNetworkWrapper,
  StyledNetworkStatus,
  StatusDot,
  StyledNavList,
  StyledNavLink,
  ExpandedLinks,
  StyledExpandedLink,
  SoonLabel,
} from './styles';
import { NAV_LINKS } from '~/constants/routes';
import { useWindowWidth } from '~/hooks/utility';

interface ISidebarProps {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Sidebar: React.FC<ISidebarProps> = ({
  mobileMenuOpen,
  toggleMobileMenu,
}) => {
  const { networkName, networkLoading } = useNetwork();
  const { count } = useNotifications();
  const { isMobile } = useWindowWidth();
  const [fullWidth, setFullWidth] = useState(!isMobile);
  const [linksExpanded, setLinksExpanded] = useState(false);

  const toggleSidebarWidth = () => setFullWidth((prev) => !prev);
  const expandPopup = () => setLinksExpanded(true);
  const collapsePopup = () => setLinksExpanded(false);
  const handleOpenLink = (url: string) => window.open(url, '_blank');

  useEffect(() => {
    if (isMobile) return;

    setFullWidth(true);
  }, [isMobile]);

  const sidebarExpanded = isMobile ? mobileMenuOpen : fullWidth;

  return (
    <StyledSidebar fullWidth={sidebarExpanded}>
      {sidebarExpanded ? (
        <Icon name="PolymeshLogo" className="text-logo-icon" />
      ) : (
        <Icon name="PolymeshSymbol" className="logo-icon" />
      )}
      <MenuButton fullWidth={sidebarExpanded} onClick={toggleSidebarWidth}>
        <Icon name="MenuIcon" />
      </MenuButton>
      <StyledNetworkWrapper fullWidth={sidebarExpanded}>
        <StyledNetworkStatus fullWidth={sidebarExpanded}>
          <StatusDot isLoading={networkLoading} fullWidth={sidebarExpanded} />
          {networkLoading ? '' : <span>{networkName}</span>}
        </StyledNetworkStatus>
      </StyledNetworkWrapper>
      <nav>
        <StyledNavList fullWidth={sidebarExpanded}>
          {NAV_LINKS.map(
            ({
              path,
              label,
              icon,
              expandable,
              notifications,
              disabled,
              nestedLinks,
            }) => (
              <li key={label}>
                <StyledNavLink
                  to={path}
                  disabled={disabled}
                  onClick={(e) => {
                    if (!expandable) return;
                    e.preventDefault();
                    expandPopup();
                  }}
                  onMouseEnter={
                    expandable
                      ? (expandPopup as React.MouseEventHandler<HTMLAnchorElement>)
                      : undefined
                  }
                  onMouseLeave={
                    expandable
                      ? (collapsePopup as React.MouseEventHandler<HTMLAnchorElement>)
                      : undefined
                  }
                >
                  <Icon name={icon} className="link-icon" size="24px" />
                  <span>{label}</span>
                  {notifications && count[notifications] ? (
                    <NotificationCounter
                      count={count[notifications]}
                      className="notification"
                    />
                  ) : null}
                  {disabled && sidebarExpanded && <SoonLabel>Soon</SoonLabel>}
                  {expandable && linksExpanded && (
                    <ExpandedLinks>
                      {nestedLinks?.map(
                        ({ nestedPath, nestedLabel, nestedIcon }) => (
                          <li key={nestedLabel}>
                            <StyledExpandedLink
                              onClick={() => handleOpenLink(nestedPath)}
                            >
                              <Icon
                                name={nestedIcon}
                                className="link-icon"
                                size="24px"
                              />
                              {nestedLabel}
                            </StyledExpandedLink>
                          </li>
                        ),
                      )}
                    </ExpandedLinks>
                  )}
                </StyledNavLink>
              </li>
            ),
          )}
        </StyledNavList>
      </nav>
    </StyledSidebar>
  );
};

export default Sidebar;
