import { useLocalStorage } from '~/hooks/utility';
import { useAuthContext } from '~/context/AuthContext';
import { Modal, Icon } from '~/components';
import { Text, Button } from '~/components/UiKit';
import { StyledCloseButton } from '../../styles';
import {
  StyledWelcomeWrapper,
  StyledWelcomePopup,
  StyledButtonsContainer,
} from './styles';

export const PopupWelcome = () => {
  const { setConnectPopup, isMobileDevice, setIsNewWalletMobile } =
    useAuthContext();
  const [showWelcome, setShowWelcome] = useLocalStorage(
    'showWelcomePopup',
    true,
  );

  const handleProceed = (isNewWallet: boolean = true) => {
    setShowWelcome(false);
    if (isMobileDevice) {
      setIsNewWalletMobile(!!isNewWallet);
    }
    setConnectPopup(isMobileDevice ? 'extensionsMobile' : 'extensions');
  };

  const handleDismissWelcome = () => {
    setShowWelcome(false);
  };

  if (!showWelcome) {
    return null;
  }
  return (
    <Modal handleClose={() => {}} disableOverflow customWidth="fit-content">
      <StyledWelcomeWrapper>
        <StyledWelcomePopup>
          <StyledCloseButton onClick={handleDismissWelcome}>
            <Icon name="CloseCircledIcon" size="24px" />
          </StyledCloseButton>
          <h3>Welcome to Polymesh!</h3>
          <Text size="large">Your solution for secure blockchain</Text>
          <Text size="large">
            Join Polymesh and streamline your security token operations on a
            blockchain designed for compliance and efficiency. Start leveraging
            a secure and transparent platform today—simplify your transactions
            and safeguard your digital assets.{' '}
          </Text>
          <Text size="large" bold>
            To use Polymesh, you need to first create a new wallet or connect
            existing.
          </Text>
          <StyledButtonsContainer>
            {isMobileDevice ? (
              <Button
                onClick={() => handleProceed(false)}
                variant="transparent"
                className="transparent-btn"
              >
                Connect Existing Wallet
              </Button>
            ) : (
              <Button
                onClick={handleDismissWelcome}
                variant="transparent"
                className="transparent-btn"
              >
                I’ll do this later
              </Button>
            )}
            <Button onClick={handleProceed} variant="modalSecondary">
              Setup Wallet Now
            </Button>
          </StyledButtonsContainer>
        </StyledWelcomePopup>
      </StyledWelcomeWrapper>
    </Modal>
  );
};
