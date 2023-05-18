import { useContext, useEffect, useRef, useState } from 'react';
import { useBalance, useNetwork, useNotifications } from '~/hooks/polymesh';
import { CopyToClipboard, Icon } from '~/components';
import { NotificationCounter, SkeletonLoader, Text } from '../UiKit';
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
  StyledCloseMenuButton,
  StyledAccountInfo,
} from './styles';
import { NAV_LINKS } from '~/constants/routes';
import { useWindowWidth } from '~/hooks/utility';
import { formatBalance, formatDid } from '~/helpers/formatters';
import { AccountContext } from '~/context/AccountContext';

interface ISidebarProps {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Sidebar: React.FC<ISidebarProps> = ({
  mobileMenuOpen,
  toggleMobileMenu,
}) => {
  const { identity, identityLoading } = useContext(AccountContext);
  const { networkName, networkLoading } = useNetwork();
  const { balance, balanceIsLoading } = useBalance();
  const { count } = useNotifications();
  const { isMobile, isTablet } = useWindowWidth();
  const [fullWidth, setFullWidth] = useState(!isMobile);
  const [linksExpanded, setLinksExpanded] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const toggleSidebarWidth = () => setFullWidth((prev) => !prev);
  const expandPopup = () => setLinksExpanded(true);
  const collapsePopup = () => setLinksExpanded(false);
  const handleOpenLink = (url: string) => window.open(url, '_blank');

  useEffect(() => {
    if (isMobile) return;

    if (isTablet) {
      setFullWidth(false);
    } else {
      setFullWidth(true);
    }
  }, [isMobile, isTablet]);

  const sidebarExpanded = isMobile ? mobileMenuOpen : fullWidth;

  return (
    <StyledSidebar fullWidth={sidebarExpanded} ref={sidebarRef}>
      {sidebarExpanded || isMobile ? (
        <Icon name="PolymeshLogo" className="text-logo-icon" />
      ) : (
        <Icon name="PolymeshSymbol" className="logo-icon" />
      )}
      {isMobile ? (
        <StyledCloseMenuButton onClick={toggleMobileMenu}>
          <Icon name="CloseIcon" size="24px" />
        </StyledCloseMenuButton>
      ) : (
        <MenuButton fullWidth={sidebarExpanded} onClick={toggleSidebarWidth}>
          <Icon name="MenuIcon" />
        </MenuButton>
      )}
      <div className="container">
        {isMobile && (
          <>
            <StyledAccountInfo>
              {identityLoading || balanceIsLoading ? (
                <SkeletonLoader />
              ) : (
                <>
                  <Icon name="PolymeshSymbol" size="24px" />
                  <Text bold size="large">
                    {formatBalance(balance.total)} <span>POLYX</span>
                  </Text>
                </>
              )}
            </StyledAccountInfo>
            <StyledAccountInfo>
              {identityLoading ? (
                <SkeletonLoader />
              ) : (
                <>
                  <Icon name="IdCard" size="24px" />
                  <span>{formatDid(identity?.did, 10, 9)}</span>
                  <CopyToClipboard value={identity?.did} />
                </>
              )}
            </StyledAccountInfo>
          </>
        )}
        <StyledNetworkWrapper fullWidth={sidebarExpanded}>
          <StyledNetworkStatus
            fullWidth={sidebarExpanded}
            isLoading={networkLoading}
          >
            {networkLoading ? (
              <SkeletonLoader height="30px" />
            ) : (
              <>
                <StatusDot
                  isLoading={networkLoading}
                  fullWidth={sidebarExpanded}
                />
                {networkLoading ? '' : <span>{networkName}</span>}
              </>
            )}
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
                      if (expandable) {
                        e.preventDefault();
                        if (linksExpanded) {
                          collapsePopup();
                        } else {
                          if (isMobile && sidebarRef.current) {
                            sidebarRef.current.scroll({
                              top: 0,
                              behavior: 'smooth',
                            });
                          }
                          expandPopup();
                        }

                        return;
                      }
                      if (isMobile) {
                        toggleMobileMenu();
                      }
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
                        {isMobile && (
                          <StyledCloseMenuButton onClick={collapsePopup}>
                            <Icon name="CloseIcon" size="24px" />
                          </StyledCloseMenuButton>
                        )}
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
      </div>
    </StyledSidebar>
  );
};

export default Sidebar;
