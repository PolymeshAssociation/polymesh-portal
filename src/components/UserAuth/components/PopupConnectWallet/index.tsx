import { useAuthContext } from '~/context/AuthContext';
import { Text } from '~/components/UiKit';
import { Modal } from '~/components';
import { PopupHeader } from '../PopupHeader';
import { ExtensionSelect } from './components/ExtensionSelect';
import { ExtensionInfo } from './components/ExtensionInfo';
import { ExtensionInfoMobile } from './components/ExtensionInfoMobile';
import { ManualConnect } from './components/ManualConnect';
import { WalletSelect } from './components/WalletSelect';
import { StyledModalContent } from './styles';

export const PopupConnectWallet = () => {
  const { connectPopup, setConnectPopup, isMobileDevice } = useAuthContext();

  const renderPopupSubtitle = () => {
    switch (connectPopup) {
      case 'extensions':
        return 'In order to fully utilize Polymesh, you need to select a compatible wallet.';
      case 'Polymesh':
      case 'Polkadot':
      case 'Talisman':
      case 'Subwallet':
      case 'Nova':
        return `Follow the below steps to get started with the ${connectPopup} wallet.`;
      case 'wallet':
        return 'Select the wallet address to connect and continue.';
      default:
        return '';
    }
  };

  const renderPopupContent = () => {
    switch (connectPopup) {
      case 'extensions':
      case 'extensionsMobile':
        return <ExtensionSelect />;
      case 'Polymesh':
      case 'Polkadot':
      case 'Talisman':
      case 'Subwallet':
      case 'Nova':
        return isMobileDevice ? <ExtensionInfoMobile /> : <ExtensionInfo />;
      case 'manual':
        return <ManualConnect />;
      case 'wallet':
        return <WalletSelect />;
      default:
        return <ExtensionSelect />;
    }
  };

  if (!connectPopup) {
    return null;
  }

  return (
    <Modal handleClose={() => setConnectPopup(null)} customWidth="fit-content">
      <StyledModalContent>
        <PopupHeader
          title={
            connectPopup === 'manual'
              ? 'Manually Connect Key'
              : 'Connect Wallet'
          }
          subTitle={renderPopupSubtitle()}
          icon="ConnectWalletIcon"
        >
          {connectPopup === 'manual' ? (
            <Text bold size="large">
              Manually entered keys, not stored in the connected wallet, allow
              view only functionality. In order to fully utilize Polymesh, you
              need to connect a key stored in a supported wallet.
            </Text>
          ) : null}
        </PopupHeader>
        {renderPopupContent()}
      </StyledModalContent>
    </Modal>
  );
};
