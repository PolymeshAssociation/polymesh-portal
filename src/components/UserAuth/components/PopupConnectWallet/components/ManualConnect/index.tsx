import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useAuthContext } from '~/context/AuthContext';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { CustomInput, useInput } from '../../../CustomInput';

export const ManualConnect = () => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { setSelectedAccount } = useContext(AccountContext);
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

    setSelectedAccount(value);
    setConnectPopup(null);
  };

  return (
    <>
      <CustomInput
        autoFocus
        label="Enter the key to select"
        placeholder="Wallet Key"
        handleChange={handleInputChange}
        value={value}
        error={error}
      />
      <PopupActionButtons
        onProceed={handleManualWalletConnect}
        onGoBack={() => setConnectPopup('extensions')}
        data-event-category="onboarding"
        data-event-name="connect-manual-view"
        proceedTag="wallet-proceed"
        matomoData={{
          eventCategory: 'onboarding',
          eventName: "connect-manual-view"
        }}
        canProceed={!error && !!value}
      />
    </>
  );
};
