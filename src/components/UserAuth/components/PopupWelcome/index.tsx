import { useLocalStorage } from '~/hooks/utility';
import { useAuthContext } from '~/context/AuthContext';
import { Modal } from '~/components';
import { Text, Button } from '~/components/UiKit';
import {
  StyledWelcomeWrapper,
  StyledWelcomePopup,
  StyledButtonsContainer,
} from './styles';

export const PopupWelcome = () => {
  const { setConnectPopup, isMobileDevice } = useAuthContext();
  const [showWelcome, setShowWelcome] = useLocalStorage(
    'showWelcomePopup',
    true,
  );

  const handleProceed = () => {
    setShowWelcome(false);
    setConnectPopup(isMobileDevice ? 'extensionsMobile' : 'extensions');
  };

  const defaultAccount = JSON.parse(
    localStorage.getItem('defaultAccount') || 'null',
  );

  if (!showWelcome && defaultAccount) {
    return null;
  }
  return (
    <Modal handleClose={() => {}} disableOverflow customWidth="fit-content">
      <StyledWelcomeWrapper>
        <StyledWelcomePopup>
          <h3>Welcome to Polymesh!</h3>
          <Text size="large">A Secure Blockchain for Security Tokens</Text>
          <Text size="large">
            Polymesh helps you streamline your digital asset management on a
            blockchain designed for compliance and efficiency. Use the secure
            and transparent platform to simplify transactions and safeguard your
            digital assets.
          </Text>
          <Text size="large" bold>
            To use Polymesh, create a new wallet or connect an existing one.
          </Text>
          <StyledButtonsContainer>
            <Button onClick={handleProceed} variant="modalSecondary">
              Connect Wallet Now
            </Button>
          </StyledButtonsContainer>
        </StyledWelcomePopup>
      </StyledWelcomeWrapper>
    </Modal>
  );
};
