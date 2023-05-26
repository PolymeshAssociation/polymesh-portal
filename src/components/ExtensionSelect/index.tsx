import { useContext, useState } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { PolymeshContext } from '~/context/PolymeshContext';
import { WALLET_CONNECT_OPTIONS } from '~/constants/wallets';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { WalletOptionGroup } from './components/WalletOptionGroup';
import { StyledButtonWrapper } from './styles';
import { useWindowWidth } from '~/hooks/utility';

interface IExtensionSelectProps {
  handleClose: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}

const ExtensionSelect: React.FC<IExtensionSelectProps> = ({ handleClose }) => {
  const {
    connectWallet,
    settings: { defaultExtension },
  } = useContext(PolymeshContext);
  const [selectedWallet, setSelectedWallet] = useState(defaultExtension);
  const injectedExtensions = BrowserExtensionSigningManager.getExtensionList();
  const { isMobile } = useWindowWidth();

  // Check if any of available extensions are installed to display them accordingly
  const walletOptions = WALLET_CONNECT_OPTIONS.map((option) => {
    if (injectedExtensions.includes(option.extensionName)) {
      return { ...option, isInstalled: true };
    }
    return { ...option, isInstalled: false };
  });

  const handleWalletSelect: React.ChangeEventHandler = ({ target }) => {
    setSelectedWallet((target as HTMLInputElement).value);
  };

  const handleCancel = () => {
    setSelectedWallet('');
    handleClose();
  };

  const handleConnectWallet = () => {
    connectWallet(selectedWallet);
    handleClose();
  };

  return (
    <Modal handleClose={handleClose}>
      <Heading type="h4" marginBottom={32}>
        Choose Wallet to Connect
      </Heading>
      <WalletOptionGroup
        options={walletOptions}
        onChange={handleWalletSelect}
        selectedWallet={selectedWallet}
      />
      <StyledButtonWrapper>
        {!isMobile && (
          <Button variant="modalSecondary" onClick={handleCancel}>
            Cancel
          </Button>
        )}
        <Button
          variant="modalPrimary"
          disabled={!selectedWallet || selectedWallet === defaultExtension}
          onClick={handleConnectWallet}
        >
          Connect
        </Button>
      </StyledButtonWrapper>
    </Modal>
  );
};

export default ExtensionSelect;
