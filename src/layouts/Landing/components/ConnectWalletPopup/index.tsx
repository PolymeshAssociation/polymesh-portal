import { useContext, useState } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useInjectedWeb3 } from '~/hooks/polymesh';
import { WALLET_CONNECT_OPTIONS } from '~/constants/wallets';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { WalletOptionGroup } from '../WalletOptionGroup';
import { DefaultSelectionCheckbox } from '../DefaultSelectionCheckbox';
import { StyledButtonWrapper } from './styles';

export const ConnectWalletPopup = ({ handleClose }) => {
  const { connectWallet } = useContext(PolymeshContext);
  const { injectedExtensions } = useInjectedWeb3();
  const [selectedWallet, setSelectedWallet] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Check if any of available extensions are installed to display them accordingly
  const walletOptions = WALLET_CONNECT_OPTIONS.map((option) => {
    if (injectedExtensions.includes(option.extensionName)) {
      return { ...option, isInstalled: true };
    }
    return { ...option, isInstalled: false };
  });

  const handleWalletSelect: React.ReactEventHandler = ({ target }) => {
    setSelectedWallet(target.value);
  };

  const handleDefaultSelect: React.ReactEventHandler = ({ target }) => {
    setIsDefault(target.checked);
  };

  const handleCancel = () => {
    setSelectedWallet('');
    handleClose();
  };

  const handleConnectWallet = () => {
    connectWallet({ extensionName: selectedWallet, isDefault });
  };

  return (
    <Modal handleClose={handleClose}>
      <Heading type="h4" marginBottom={32}>
        Choose Wallet to Connect
      </Heading>
      <WalletOptionGroup
        options={walletOptions}
        onChange={handleWalletSelect}
      />
      <DefaultSelectionCheckbox
        disabled={!selectedWallet}
        onChange={handleDefaultSelect}
      />
      <StyledButtonWrapper>
        <Button variant="modalSecondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          disabled={!selectedWallet}
          onClick={handleConnectWallet}
        >
          Apply
        </Button>
      </StyledButtonWrapper>
    </Modal>
  );
};
