import { useState } from 'react';
import { TConnectModalType } from '../../constants';
import { Text } from '~/components/UiKit';
import { PopupHeader } from '../PopupHeader';
import { SecondaryButton } from '../SecondaryButton';
import { ExtensionSelect } from './components/ExtensionSelect';
import { ExtensionInfo } from './components/ExtensionInfo';
import { ManualConnect } from './components/ManualConnect';
import { WalletSelect } from './components/WalletSelect';

interface IPopupConnectWalletProps {
  handleProceed: () => void;
  handleClose: () => void;
}
export const PopupConnectWallet = ({
  handleProceed,
  handleClose,
}: IPopupConnectWalletProps) => {
  const [modalType, setModalType] = useState<TConnectModalType>('extensions');

  const handleNavigate = (type: TConnectModalType) => setModalType(type);

  const handleOpenArticle = () =>
    window.open(
      'https://polymesh.network/blog/blockchain-wallets-explained',
      '_blank',
    );

  const renderPopupSubtitle = () => {
    switch (modalType) {
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
    switch (modalType) {
      case 'extensions':
        return (
          <ExtensionSelect
            handleNavigate={handleNavigate}
            handleClose={handleClose}
          />
        );
      case 'Polymesh':
      case 'Polkadot':
      case 'Talisman':
      case 'Subwallet':
      case 'Nova':
        return (
          <ExtensionInfo
            selectedExtension={modalType}
            navigate={handleNavigate}
          />
        );
      case 'manual':
        return (
          <ManualConnect navigate={handleNavigate} handleClose={handleClose} />
        );
      case 'wallet':
        return (
          <WalletSelect
            handleProceed={handleProceed}
            handleGoBack={() => handleNavigate('extensions')}
          />
        );
      default:
        return (
          <ExtensionSelect
            handleNavigate={handleNavigate}
            handleClose={handleClose}
          />
        );
    }
  };

  return (
    <>
      <PopupHeader
        title={
          modalType === 'manual' ? 'Manually Connect Wallet' : 'Connect Wallet'
        }
        subTitle={renderPopupSubtitle()}
        icon="ConnectWalletIcon"
        handleClick={handleClose}
      >
        {modalType === 'manual' ? (
          <Text bold size="large">
            In order to fully utilize Polymesh, you need to connect a supported
            wallet key. For a list of supported wallets and help with this
            process{' '}
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
    </>
  );
};
