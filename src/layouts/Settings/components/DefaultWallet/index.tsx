import { useContext, useMemo, useState } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { PolymeshContext } from '~/context/PolymeshContext';
import { ExtensionSelect } from '~/components';
import { StyledLabel, StyledValue } from './styles';

export const DefaultWallet = () => {
  const {
    settings: { defaultExtension },
  } = useContext(PolymeshContext);
  const [modalOpen, setModalOpen] = useState(false);

  const injectedExtensions = useMemo(() => {
    return BrowserExtensionSigningManager.getExtensionList();
  }, []);

  return (
    <>
      <StyledValue onClick={() => setModalOpen((prev) => !prev)}>
        {defaultExtension ? (
          <>
            {defaultExtension}
            {!injectedExtensions.includes(defaultExtension) && (
              <StyledLabel>Not Installed</StyledLabel>
            )}
          </>
        ) : (
          'None'
        )}
      </StyledValue>
      {modalOpen && <ExtensionSelect handleClose={() => setModalOpen(false)} />}
    </>
  );
};
