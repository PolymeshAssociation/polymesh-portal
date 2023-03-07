import { useContext, useState } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { WalletOptionGroup } from '../WalletOptionGroup';
import { DefaultSelectionCheckbox } from '../DefaultSelectionCheckbox';
import { StyledButtonWrapper } from './styles';
import { WALLET_CONNECT_OPTIONS } from '~/constants/wallets';

export const ConnectWalletPopup = ({ handleClose }) => {
  const { connectWallet } = useContext(PolymeshContext);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [isDefault, setIsDefault] = useState(false);

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
    connectWallet({ selectedWallet, isDefault });
  };

  return (
    <Modal handleClose={handleClose}>
      <Heading type="h4" marginBottom={32}>
        Choose Wallet to Connect
      </Heading>
      <WalletOptionGroup
        options={WALLET_CONNECT_OPTIONS}
        onChange={handleWalletSelect}
      />
      <DefaultSelectionCheckbox
        disabled={!selectedWallet}
        onChange={handleDefaultSelect}
      />
      <StyledButtonWrapper>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button disabled={!selectedWallet} onClick={handleConnectWallet}>
          Apply
        </Button>
      </StyledButtonWrapper>
    </Modal>
  );
};
