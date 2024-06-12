import { WalletSelect as WalletSelectComponent } from '~/components';
import { Text } from '~/components/UiKit';
import { useAuthContext } from '~/context/AuthContext';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { StyledWalletSelectContainer } from './styles';

export const WalletSelect = () => {
  const { setConnectPopup } = useAuthContext();
  return (
    <>
      <StyledWalletSelectContainer>
        <Text marginBottom={8} bold>
          Wallet Address
        </Text>
        <WalletSelectComponent placement="widget" showExternal={false} />
      </StyledWalletSelectContainer>
      <PopupActionButtons
        onProceed={() => setConnectPopup(null)}
        onGoBack={() => setConnectPopup('extensions')}
        aligned
      />
    </>
  );
};
