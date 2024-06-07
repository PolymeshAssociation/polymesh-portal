import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { TConnectModalType } from '../../../../constants';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { CustomInput, useInput } from '../../../CustomInput';

interface IManualConnectProps {
  navigate: (type: TConnectModalType) => void;
  handleClose: () => void;
}

export const ManualConnect = ({
  navigate,
  handleClose,
}: IManualConnectProps) => {
  const {
    connectWallet,
    api: { sdk },
  } = useContext(PolymeshContext);
  const { setExternalAccounKey } = useContext(AccountContext);

  const { value, error, handleInputChange, handleErrorChange } = useInput();

  const handleManualWalletConnect = async () => {
    if (!sdk) {
      return;
    }
    const isValidAddress = sdk.accountManagement.isValidAddress({
      address: value,
    });
    if (!isValidAddress) {
      handleErrorChange('Invalid wallet address.');
      return;
    }

    await connectWallet('');
    setExternalAccounKey(value);
    handleClose();
  };

  return (
    <>
      <CustomInput
        label="Paste the wallet key to onboard"
        placeholder="Wallet Key"
        handleChange={handleInputChange}
        value={value}
        error={error}
      />
      <PopupActionButtons
        onProceed={handleManualWalletConnect}
        onGoBack={() => navigate('extensions')}
        canProceed={!error && !!value}
      />
    </>
  );
};
