import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useAuthContext } from '~/context/AuthContext';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { CustomInput, useInput } from '../../../CustomInput';

export const ManualConnect = () => {
  const {
    connectWallet,
    api: { sdk },
  } = useContext(PolymeshContext);
  const { setExternalAccounKey } = useContext(AccountContext);
  const { setConnectPopup } = useAuthContext();

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
    setConnectPopup(null);
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
        onGoBack={() => setConnectPopup('extensions')}
        canProceed={!error && !!value}
      />
    </>
  );
};
