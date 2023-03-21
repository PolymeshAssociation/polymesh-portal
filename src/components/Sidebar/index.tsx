import { useState } from 'react';
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

const Sidebar = () => {
  const { networkName, networkLoading } = useNetwork();
  const { count } = useNotifications();
  const [fullWidth, setFullWidth] = useState(true);
  const [linksExpanded, setLinksExpanded] = useState(false);

  const toggleSidebarWidth = () => setFullWidth((prev) => !prev);
  const expandPopup = () => setLinksExpanded(true);
  const collapsePopup = () => setLinksExpanded(false);
  const handleOpenLink = (url: string) => window.open(url, '_blank');

  return (
    <StyledSidebar fullWidth={fullWidth}>
      {fullWidth ? (
        <Icon name="PolymeshLogo" className="text-logo-icon" />
      ) : (
        <Icon name="PolymeshSymbol" className="logo-icon" />
      )}
      <MenuButton fullWidth={fullWidth} onClick={toggleSidebarWidth}>
        <Icon name="MenuIcon" />
      </MenuButton>
      <StyledNetworkWrapper fullWidth={fullWidth}>
        <StyledNetworkStatus fullWidth={fullWidth}>
          <StatusDot isLoading={networkLoading} fullWidth={fullWidth} />
          {networkLoading ? '' : <span>{networkName}</span>}
        </StyledNetworkStatus>
      </StyledNetworkWrapper>
      <nav>
        <StyledNavList fullWidth={fullWidth}>
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
                  onMouseEnter={expandable ? expandPopup : null}
                  onMouseLeave={expandable ? collapsePopup : null}
                >
                  <Icon name={icon} className="link-icon" size="24px" />
                  <span>{label}</span>
                  {count[notifications] ? (
                    <NotificationCounter
                      count={count[notifications]}
                      className="notification"
                    />
                  ) : null}
                  {disabled && fullWidth && <SoonLabel>Soon</SoonLabel>}
                  {expandable && linksExpanded && (
                    <ExpandedLinks fullWidth={fullWidth}>
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
