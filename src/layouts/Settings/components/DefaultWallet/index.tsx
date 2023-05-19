import { useContext, useState } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { PolymeshContext } from '~/context/PolymeshContext';
import { ExtensionSelect } from '~/components';
import { StyledLabel, StyledValue } from './styles';

const injectedExtensions = BrowserExtensionSigningManager.getExtensionList();

export const DefaultWallet = () => {
  const {
    settings: { defaultExtension },
  } = useContext(PolymeshContext);
  const [modalOpen, setModalOpen] = useState(false);

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
