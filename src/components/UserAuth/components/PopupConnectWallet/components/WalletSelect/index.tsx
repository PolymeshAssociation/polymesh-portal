import { WalletSelect as WalletSelectComponent } from '~/components';
import { Text } from '~/components/UiKit';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { StyledWalletSelectContainer } from './styles';

interface IWalletSelectProps {
  handleGoBack: () => void;
  handleProceed: () => void;
}

export const WalletSelect = ({
  handleProceed,
  handleGoBack,
}: IWalletSelectProps) => {
  return (
    <>
      <StyledWalletSelectContainer>
        <Text marginBottom={8} bold>
          Wallet Address
        </Text>
        <WalletSelectComponent placement="widget" showExternal={false} />
      </StyledWalletSelectContainer>
      <PopupActionButtons
        onProceed={handleProceed}
        onGoBack={handleGoBack}
        aligned
      />
    </>
  );
};
