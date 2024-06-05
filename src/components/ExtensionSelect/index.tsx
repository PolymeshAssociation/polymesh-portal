import { useContext, useMemo, useState } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { PolymeshContext } from '~/context/PolymeshContext';
import {
  EXTENSION_CONNECT_OPTIONS,
  IExtensionConnectOption,
} from '~/constants/wallets';
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
    state: { initialized },
  } = useContext(PolymeshContext);
  const [selectedWallet, setSelectedWallet] = useState(defaultExtension);
  const { isMobile } = useWindowWidth();
  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  // Check if any of available extensions are installed to display them accordingly
  const walletOptions = useMemo(() => {
    const injectedExtensions =
      BrowserExtensionSigningManager.getExtensionList();
    return Object.values(EXTENSION_CONNECT_OPTIONS).map(
      (option: IExtensionConnectOption) => ({
        ...option,
        isInstalled: injectedExtensions.includes(option.extensionName),
      }),
    );
  }, []);

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
        isMobileDevice={isMobileDevice}
      />
      <StyledButtonWrapper>
        {!isMobile && (
          <Button variant="modalSecondary" onClick={handleCancel}>
            Cancel
          </Button>
        )}
        <Button
          variant="modalPrimary"
          disabled={
            !selectedWallet ||
            (selectedWallet === defaultExtension && initialized)
          }
          onClick={handleConnectWallet}
        >
          Connect
        </Button>
      </StyledButtonWrapper>
    </Modal>
  );
};

export default ExtensionSelect;
