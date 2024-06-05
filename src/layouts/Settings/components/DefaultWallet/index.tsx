import { useContext, useMemo } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { useAuthContext } from '~/context/AuthContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { StyledLabel, StyledValue } from './styles';

export const DefaultWallet = () => {
  const {
    settings: { defaultExtension },
  } = useContext(PolymeshContext);

  const { setConnectPopup } = useAuthContext();

  const injectedExtensions = useMemo(() => {
    return BrowserExtensionSigningManager.getExtensionList();
  }, []);

  return (
    <StyledValue onClick={() => setConnectPopup('extensions')}>
      {defaultExtension ? (
        <>
          {defaultExtension}
          {!injectedExtensions.includes(defaultExtension) &&
            defaultExtension !== 'walletConnect' && (
              <StyledLabel>Not Installed</StyledLabel>
            )}
        </>
      ) : (
        'None'
      )}
    </StyledValue>
  );
};
