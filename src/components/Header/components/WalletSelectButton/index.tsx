import { useContext } from 'react';
import { StyledWrapper } from './styles';
import { Icon } from '~/components';
import AuthContext from '~/context/AuthContext/context';

export const WalletSelectButton = () => {
  const { setConnectPopup } = useContext(AuthContext);

  return (
    <StyledWrapper
      onClick={() => {
        setConnectPopup('extensions');
      }}
      matomoData={{
        eventCategory: "onboarding",
        eventAction: "connect-wallet",
        eventName: "header"
      }}
    >
      <Icon size="24px" name="Wallet" />
    </StyledWrapper>
  );
};
