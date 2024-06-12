import { useAuthContext } from '~/context/AuthContext';
import { Text } from '~/components/UiKit';
import { Modal } from '~/components';
import { PopupHeader } from '../PopupHeader';
import { SecondaryButton } from '../SecondaryButton';
import { ExtensionSelect } from './components/ExtensionSelect';
import { ExtensionInfo } from './components/ExtensionInfo';
import { ManualConnect } from './components/ManualConnect';
import { WalletSelect } from './components/WalletSelect';
import { StyledModalContent } from './styles';

export const PopupConnectWallet = () => {
  const { connectPopup, setConnectPopup } = useAuthContext();

  const handleOpenArticle = () =>
    window.open(
      'https://polymesh.network/blog/blockchain-wallets-explained',
      '_blank',
    );

  const renderPopupSubtitle = () => {
    switch (connectPopup) {
      case 'extensions':
      case 'Polymesh':
      case 'Polkadot':
      case 'Talisman':
      case 'Subwallet':
      case 'Nova':
        return 'In order to fully utilize Polymesh, you need to create or connect a wallet.';
      case 'wallet':
        return 'Select the wallet address to authorize and continue.';
      default:
        return '';
    }
  };

  const renderPopupContent = () => {
    switch (connectPopup) {
      case 'extensions':
        return <ExtensionSelect />;
      case 'Polymesh':
      case 'Polkadot':
      case 'Talisman':
      case 'Subwallet':
      case 'Nova':
        return <ExtensionInfo selectedExtension={connectPopup} />;
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
              ? 'Manually Connect Wallet'
              : 'Connect Wallet'
          }
          subTitle={renderPopupSubtitle()}
          icon="ConnectWalletIcon"
          handleClick={() => setConnectPopup(null)}
        >
          {connectPopup === 'manual' ? (
            <Text bold size="large">
              In order to fully utilize Polymesh, you need to connect a
              supported wallet key. For a list of supported wallets and help
              with this process{' '}
              <SecondaryButton
                label="view our help articles"
                labelSize="large"
                underlined
                handleClick={handleOpenArticle}
              />
            </Text>
          ) : null}
        </PopupHeader>
        {renderPopupContent()}
      </StyledModalContent>
    </Modal>
  );
};
