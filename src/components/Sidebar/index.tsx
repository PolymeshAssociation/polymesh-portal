import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import {
  NetworkInfo,
  UnsubCallback,
} from '@polymeshassociation/browser-extension-signing-manager/types';
import { useContext, useEffect, useRef, useState } from 'react';
import { CopyToClipboard, Icon, Modal } from '~/components';
import { NAV_LINKS } from '~/constants/routes';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { formatBalance, formatDid } from '~/helpers/formatters';
import { notifyError } from '~/helpers/notifications';
import { useNotifications } from '~/hooks/polymesh';
import { useWindowWidth } from '~/hooks/utility';
import {
  Heading,
  NotificationCounter,
  SkeletonLoader,
  Text,
  WarningLabel,
} from '../UiKit';
import { NewsletterSignup } from '../UserAuth/components/NewsletterSignup';
import {
  ExpandedLinks,
  MenuButton,
  SoonLabel,
  StatusDot,
  StyledAccountInfo,
  StyledCloseMenuButton,
  StyledExpandedLink,
  StyledNavLink,
  StyledNavList,
  StyledNetworkStatus,
  StyledNetworkWrapper,
  StyledSidebar,
  WarningLabelWrapper,
} from './styles';

interface ISidebarProps {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Sidebar: React.FC<ISidebarProps> = ({
  mobileMenuOpen,
  toggleMobileMenu,
}) => {
  const {
    identity,
    identityLoading,
    selectedAccountBalance,
    balanceIsLoading,
  } = useContext(AccountContext);
  const {
    api: { signingManager, sdk },
    settings: { nodeUrl, defaultExtension },
  } = useContext(PolymeshContext);
  const [walletNetwork, setWalletNetwork] = useState<NetworkInfo | null>(null);
  const [networkLabel, setNetworkLabel] = useState<string>('');
  const [networkLoading, setNetworkLoading] = useState(true);
  const { count } = useNotifications();
  const { isMobile, isTablet } = useWindowWidth();
  const [fullWidth, setFullWidth] = useState(!isMobile);
  const [linksExpanded, setLinksExpanded] = useState(false);
  const [newsModal, setNewsModal] = useState(false);

  useEffect(() => {
    if (!sdk) return undefined;

    let unsubCb: UnsubCallback | undefined;

    (async () => {
      try {
        setNetworkLoading(true);

        if (defaultExtension === 'polywallet' && signingManager) {
          const polywalletSigningManager =
            signingManager as BrowserExtensionSigningManager;
          const network = await polywalletSigningManager.getCurrentNetwork();
          setWalletNetwork(network);

          unsubCb = polywalletSigningManager.onNetworkChange((newNetwork) => {
            setWalletNetwork(newNetwork);
          });
        } else {
          setWalletNetwork(null);
        }

        const chainNetwork = await sdk.network.getNetworkProperties();
        const chainNetworkLabel = chainNetwork.name.replace('Polymesh ', '');
        setNetworkLabel(chainNetworkLabel);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setNetworkLoading(false);
      }
    })();

    if (unsubCb) {
      return unsubCb;
    }
    return undefined;
  }, [signingManager, sdk, defaultExtension]);

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const toggleSidebarWidth = () => setFullWidth((prev) => !prev);
  const expandPopup = () => setLinksExpanded(true);
  const collapsePopup = () => setLinksExpanded(false);
  const handleOpenLink = (url: string) => window.open(url, '_blank');

  useEffect(() => {
    if (!isMobile) setFullWidth(!isTablet);
  }, [isMobile, isTablet]);

  const sidebarExpanded = isMobile ? mobileMenuOpen : fullWidth;

  return (
    <StyledSidebar $fullWidth={sidebarExpanded} ref={sidebarRef}>
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
        <MenuButton $fullWidth={sidebarExpanded} onClick={toggleSidebarWidth}>
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
                    {formatBalance(selectedAccountBalance.total)}{' '}
                    <span>POLYX</span>
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
                  {identity ? (
                    <>
                      <span>{formatDid(identity.did, 10, 9)}</span>
                      <CopyToClipboard value={identity.did} />
                    </>
                  ) : (
                    'Key is not assigned to any Identity'
                  )}
                </>
              )}
            </StyledAccountInfo>
          </>
        )}
        <StyledNetworkWrapper $fullWidth={sidebarExpanded}>
          {networkLoading ? (
            <SkeletonLoader height="32px" containerClassName="loader" />
          ) : (
            <StyledNetworkStatus
              $fullWidth={sidebarExpanded}
              $isLoading={networkLoading}
            >
              <StatusDot
                $isLoading={networkLoading}
                $fullWidth={sidebarExpanded}
              />
              {networkLabel ? <span>{networkLabel}</span> : ''}
            </StyledNetworkStatus>
          )}

          <WarningLabelWrapper $fullWidth={fullWidth}>
            {walletNetwork && walletNetwork.label !== networkLabel && (
              <WarningLabel caption="Different network is selected in wallet" />
            )}
            {nodeUrl !== import.meta.env.VITE_NODE_URL && (
              <WarningLabel caption="Custom RPC URL" />
            )}
          </WarningLabelWrapper>
        </StyledNetworkWrapper>
        <nav>
          <StyledNavList $fullWidth={sidebarExpanded}>
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
                    $disabled={disabled}
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
                        <li>
                          <StyledExpandedLink
                            onClick={() => setNewsModal(true)}
                          >
                            <Icon
                              name="PolymeshSymbol"
                              className="link-icon"
                              size="24px"
                            />
                            Newsletter
                          </StyledExpandedLink>
                        </li>
                      </ExpandedLinks>
                    )}
                  </StyledNavLink>
                </li>
              ),
            )}
          </StyledNavList>
        </nav>
      </div>
      {newsModal && (
        <Modal
          handleClose={() => setNewsModal(false)}
          customWidth="fit-content"
        >
          <Heading type="h4" marginBottom={32}>
            Stay Connected
          </Heading>
          <NewsletterSignup variant="modal" />
        </Modal>
      )}
    </StyledSidebar>
  );
};

export default Sidebar;
