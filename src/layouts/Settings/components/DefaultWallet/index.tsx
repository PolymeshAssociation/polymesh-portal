import { useContext, useMemo } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { isEvmWallet, WALLET_CONNECT } from '~/constants/wallets';
import { useAuthContext } from '~/context/AuthContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { isMetaMaskInstalled } from '~/helpers/evm';
import { StyledLabel, StyledValue } from './styles';

export const DefaultWallet = () => {
  const {
    settings: { defaultExtension },
  } = useContext(PolymeshContext);

  const { setConnectPopup } = useAuthContext();

  const injectedExtensions = useMemo(() => {
    return BrowserExtensionSigningManager.getExtensionList();
  }, []);

  // WalletConnect is not an extension at all, and Ethereum wallets are injected as EIP-1193
  // providers rather than into the Polkadot extension list — so neither can be checked against it.
  const isInstalled = useMemo(() => {
    if (defaultExtension === WALLET_CONNECT) return true;
    if (isEvmWallet(defaultExtension)) return isMetaMaskInstalled();
    return injectedExtensions.includes(defaultExtension);
  }, [defaultExtension, injectedExtensions]);

  return (
    <StyledValue onClick={() => setConnectPopup('extensions')}>
      {defaultExtension ? (
        <>
          {defaultExtension}
          {!isInstalled && <StyledLabel>Not Installed</StyledLabel>}
        </>
      ) : (
        'None'
      )}
    </StyledValue>
  );
};
