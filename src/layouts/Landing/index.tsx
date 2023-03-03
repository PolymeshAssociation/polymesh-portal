import { useContext } from 'react';
import Lottie from 'lottie-react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { StyledLogoBox, StyledInfoBox, StyledAnimationBox } from './styles';
import { Icon } from '~/components';
import { Button } from '~/components/UiKit';
import landingAnimation from '~/assets/animations/landingAnimation.json';

const Landing = () => {
  const {
    connectWallet,
    // state: { initialized, connecting },
  } = useContext(PolymeshContext);

  return (
    <>
      <StyledLogoBox>
        <Icon name="PolymeshLogo" />
      </StyledLogoBox>
      <StyledInfoBox>
        <h1>Welcome to the Polymesh Dashboard</h1>
        <p>
          The Polymesh Dashboard is where you can access Polymesh supported
          dApps and manage your Polymesh Account, your regulated assets and
          POLYX.
        </p>
        {/* {!initialized && !connecting && ( */}
        <Button onClick={connectWallet} variant="accent" marginTop={48}>
          <Icon name="Wallet" />
          Connect wallet
        </Button>
        {/* )} */}
      </StyledInfoBox>
      <StyledAnimationBox>
        <Lottie animationData={landingAnimation} loop />
      </StyledAnimationBox>
    </>
  );
};

export default Landing;
