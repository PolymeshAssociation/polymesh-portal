import { useContext } from 'react';
import Lottie from 'lottie-react';
import { Navigate } from 'react-router-dom';
import { PolymeshContext } from '~/context/PolymeshContext';
import { StyledLogoBox, StyledInfoBox, StyledAnimationBox } from './styles';
import { Icon } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import landingAnimation from '~/assets/animations/landingAnimation.json';
import { PATHS } from '~/constants/routes';

const Landing = () => {
  const {
    connectWallet,
    state: { connecting },
  } = useContext(PolymeshContext);

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
          dApps and manage your Polymesh Account, your regulated assets and
          POLYX.
        </Text>
        <Button onClick={connectWallet} variant="accent" marginTop={48}>
          <Icon name="Wallet" />
          Connect wallet
        </Button>
      </StyledInfoBox>
      <StyledAnimationBox>
        <Lottie animationData={landingAnimation} loop />
      </StyledAnimationBox>
    </>
  );
};

export default Landing;
