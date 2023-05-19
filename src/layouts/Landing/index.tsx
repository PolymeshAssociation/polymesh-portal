import { useContext, useState } from 'react';
import Lottie from 'lottie-react';
import { Navigate } from 'react-router-dom';
import { PolymeshContext } from '~/context/PolymeshContext';
import { StyledLogoBox, StyledInfoBox, StyledAnimationBox } from './styles';
import { Icon, ExtensionSelect } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
// import { ConnectWalletPopup } from './components/ConnectWalletPopup';
import landingAnimation from '~/assets/animations/landingAnimation.json';
import { PATHS } from '~/constants/routes';

const Landing = () => {
  const {
    state: { connecting },
  } = useContext(PolymeshContext);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleModal = () => setModalOpen((prev) => !prev);

  return (
    <>
      {connecting && <Navigate to={PATHS.OVERVIEW} replace />}
      <StyledLogoBox>
        <Icon name="PolymeshLogo" />
      </StyledLogoBox>
      <StyledInfoBox>
        <Heading marginBottom={16}>Welcome to the Polymesh Dashboard</Heading>
        <Text>
          The Polymesh Dashboard is where you can access Polymesh supported
          dApps and manage your account, assets, and POLYX.
        </Text>
        <Button onClick={toggleModal} variant="accent" marginTop={48}>
          <Icon name="Wallet" />
          Connect wallet
        </Button>
      </StyledInfoBox>
      <StyledAnimationBox>
        <Lottie animationData={landingAnimation} loop />
      </StyledAnimationBox>
      {modalOpen && <ExtensionSelect handleClose={toggleModal} />}
    </>
  );
};

export default Landing;
