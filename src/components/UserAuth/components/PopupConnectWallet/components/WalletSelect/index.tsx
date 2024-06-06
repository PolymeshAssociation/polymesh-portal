import { PopupActionButtons } from '../../../PopupActionButtons';
import { CustomInput, useInput } from '../../../CustomInput';

interface IWalletSelectProps {
  handleGoBack: () => void;
  handleProceed: () => void;
}

export const WalletSelect = ({
  handleProceed,
  handleGoBack,
}: IWalletSelectProps) => {
  const { value, error, handleInputChange } = useInput();
  return (
    <>
      <CustomInput
        label="Wallet address"
        placeholder="Wallet Address"
        handleChange={handleInputChange}
        value={value}
        error={error}
      />
      <PopupActionButtons
        onProceed={handleProceed}
        onGoBack={handleGoBack}
        canProceed={!error && !!value}
        aligned
      />
    </>
  );
};
