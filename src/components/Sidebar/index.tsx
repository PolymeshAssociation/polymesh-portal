import { useContext, useEffect, useState } from 'react';
import {
  NetworkInfo,
  UnsubCallback,
} from '@polymeshassociation/browser-extension-signing-manager/types';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useNotifications } from '~/hooks/polymesh';
import { Icon } from '~/components';
import { NotificationCounter, WarningLabel } from '../UiKit';
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
  WarningLabelWrapper,
} from './styles';
import { NAV_LINKS } from '~/constants/routes';
import { notifyError } from '~/helpers/notifications';

const Sidebar = () => {
  const {
    api: { signingManager, sdk },
    settings: { nodeUrl, defaultExtension },
  } = useContext(PolymeshContext);
  const [walletNetwork, setWalletNetwork] = useState<NetworkInfo | null>(null);
  const [networkLabel, setNetworkLabel] = useState<string>('');
  const [networkLoading, setNetworkLoading] = useState(true);
  const { count } = useNotifications();
  const [fullWidth, setFullWidth] = useState(true);
  const [linksExpanded, setLinksExpanded] = useState(false);

  useEffect(() => {
    if (!signingManager || !sdk) return undefined;

    let unsubCb: UnsubCallback | undefined;

    (async () => {
      try {
        setNetworkLoading(true);

        if (defaultExtension === 'polywallet') {
          const network = await signingManager.getCurrentNetwork();
          setWalletNetwork(network);

          unsubCb = signingManager.onNetworkChange((newNetwork) => {
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
          {networkLabel ? <span>{networkLabel}</span> : ''}
        </StyledNetworkStatus>
        <WarningLabelWrapper fullWidth={fullWidth}>
          {walletNetwork && walletNetwork.label !== networkLabel && (
            <WarningLabel caption="Different network is selected in wallet" />
          )}
          {nodeUrl !== import.meta.env.VITE_NODE_URL && (
            <WarningLabel caption="Custom RPC URL" />
          )}
        </WarningLabelWrapper>
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
                  {disabled && fullWidth && <SoonLabel>Soon</SoonLabel>}
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
