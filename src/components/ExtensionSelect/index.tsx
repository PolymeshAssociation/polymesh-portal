import { useContext, useState } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { PolymeshContext } from '~/context/PolymeshContext';
import { WALLET_CONNECT_OPTIONS } from '~/constants/wallets';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { WalletOptionGroup } from './components/WalletOptionGroup';
import { DefaultSelectionCheckbox } from './components/DefaultSelectionCheckbox';
import { StyledButtonWrapper } from './styles';

interface IExtensionSelectProps {
  handleClose: () => void | React.ReactEventHandler | React.ChangeEventHandler;
  isDefaultSelect?: boolean;
}

const ExtensionSelect: React.FC<IExtensionSelectProps> = ({
  handleClose,
  isDefaultSelect,
}) => {
  const {
    connectWallet,
    settings: { defaultExtension, setDefaultExtension },
  } = useContext(PolymeshContext);
  const [selectedWallet, setSelectedWallet] = useState(defaultExtension);
  const [isDefault, setIsDefault] = useState(false);
  const injectedExtensions = BrowserExtensionSigningManager.getExtensionList();

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

  const handleDefaultSelect: React.ChangeEventHandler = ({ target }) => {
    setIsDefault((target as HTMLInputElement).checked);
  };

  const handleCancel = () => {
    setSelectedWallet('');
    handleClose();
  };

  const handleConnectWallet = () => {
    connectWallet({ extensionName: selectedWallet, isDefault });
  };

  const handleChangeDefaultWallet = () => {
    setDefaultExtension(selectedWallet);
    handleClose();
    // Reload page when other default wallet is selected in settings?
    // window.location.reload();
  };

  return (
    <Modal handleClose={handleClose}>
      <Heading type="h4" marginBottom={32}>
        {isDefaultSelect ? 'Default Wallet' : 'Choose Wallet to Connect'}
      </Heading>
      <WalletOptionGroup
        options={walletOptions}
        onChange={handleWalletSelect}
        selectedWallet={selectedWallet}
      />
      {!isDefaultSelect && (
        <DefaultSelectionCheckbox
          disabled={!selectedWallet}
          onChange={handleDefaultSelect}
        />
      )}
      <StyledButtonWrapper>
        <Button variant="modalSecondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          disabled={!selectedWallet || selectedWallet === defaultExtension}
          onClick={
            isDefaultSelect ? handleChangeDefaultWallet : handleConnectWallet
          }
        >
          Apply
        </Button>
      </StyledButtonWrapper>
    </Modal>
  );
};

export default ExtensionSelect;
