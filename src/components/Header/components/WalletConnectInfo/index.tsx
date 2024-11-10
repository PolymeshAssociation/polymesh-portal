import { useState, useContext, useEffect } from 'react';
import { WalletConnectSigningManager } from '@polymeshassociation/walletconnect-signing-manager';
import clsx from 'clsx';
import {
  StyledWrapper,
  StyledModalContent,
  StyledDescription,
  StyledValue,
  StyledHeading,
} from './styles';
import { Icon, Modal } from '~/components';
import { PolymeshContext } from '~/context/PolymeshContext';
import { Button, Heading } from '~/components/UiKit';

export const WalletConnectInfo = () => {
  const {
    api: { signingManager },
    walletConnectConnected,
    disconnectWalletConnect,
  } = useContext(PolymeshContext);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!walletConnectConnected) {
      setExpanded(false);
    }
  }, [walletConnectConnected]);

  if (!walletConnectConnected) return null;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const session = (signingManager as WalletConnectSigningManager)?.walletConnect
    ?.session;

  if (!session) return null;

  const {
    peer: {
      metadata: { name, description, url, icons },
    },
    expiry,
  } = session;

  return (
    <>
      <StyledWrapper onClick={() => setExpanded(true)} $expanded={expanded}>
        <Icon size="24px" name="WalletConnectSymbolNoColor" />
        <Icon size="18px" name="Link" className={clsx('sub-icon')} />
      </StyledWrapper>
      {expanded && (
        <Modal handleClose={() => setExpanded(false)} customWidth="fit-content">
          <StyledModalContent>
            <Heading type="h4">
              <StyledHeading>
                <Icon size="32px" name="WalletConnectSymbol" />
                WalletConnect Connection
              </StyledHeading>
            </Heading>
            <div>
              {name && (
                <StyledDescription>
                  Connected Wallet:
                  <StyledValue>
                    {icons[0] && (
                      <img
                        src={icons[0]}
                        style={{ width: '24px' }}
                        alt="wallet logo"
                      />
                    )}
                    {name}
                  </StyledValue>
                </StyledDescription>
              )}
              {description && (
                <StyledDescription>
                  Description:
                  <StyledValue>{description}</StyledValue>
                </StyledDescription>
              )}
              {url && (
                <StyledDescription>
                  Website:
                  <StyledValue>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {url}
                    </a>
                  </StyledValue>
                </StyledDescription>
              )}
              {expiry && (
                <StyledDescription>
                  Connection Expiry:
                  <StyledValue>
                    {new Date(expiry * 1000).toLocaleString()}
                  </StyledValue>
                </StyledDescription>
              )}
            </div>
            <Button
              onClick={() => {
                disconnectWalletConnect();
                setExpanded(false);
              }}
              variant="primary"
            >
              Disconnect
            </Button>
          </StyledModalContent>
        </Modal>
      )}
    </>
  );
};
