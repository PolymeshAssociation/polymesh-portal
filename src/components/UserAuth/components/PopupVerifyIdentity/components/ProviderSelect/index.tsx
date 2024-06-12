import { useState, useEffect, useContext } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useAuthContext } from '~/context/AuthContext';
import {
  TIdentityModalType,
  FRACTAL_IDENTITY_PROVIDER,
  MOCKID_IDENTITY_PROVIDER,
} from '~/context/AuthContext/constants';
import { IDENTITY_PROVIDERS } from '../../../../constants';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { SecondaryButton } from '../../../SecondaryButton';
import { ProviderCard } from '../ProviderCard';
import { StyledProvidersContainer, StyleProviderBox } from './styles';

export const ProviderSelect = () => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { setIdentityPopup } = useAuthContext();

  const [isTestnet, setIsTestnet] = useState(false);

  useEffect(() => {
    if (!sdk) return;

    (async () => {
      const chainNetwork = await sdk.network.getNetworkProperties();
      if (chainNetwork.name.includes('Testnet')) {
        setIsTestnet(true);
      }
    })();
  }, [sdk]);

  const renderProviders = () => {
    return Object.values(IDENTITY_PROVIDERS).map((provider) => {
      if (isTestnet && provider.name === FRACTAL_IDENTITY_PROVIDER) {
        return null;
      }
      if (!isTestnet && provider.name === MOCKID_IDENTITY_PROVIDER) {
        return null;
      }
      return (
        <StyleProviderBox
          key={provider.name}
          onClick={() => setIdentityPopup(provider.name as TIdentityModalType)}
        >
          <ProviderCard provider={provider} />
        </StyleProviderBox>
      );
    });
  };

  return (
    <>
      <StyledProvidersContainer>{renderProviders()}</StyledProvidersContainer>
      <SecondaryButton
        label="I need to onboard as a business"
        handleClick={() => setIdentityPopup('business')}
      />
      <PopupActionButtons
        goBackLabel="Close"
        onGoBack={() => setIdentityPopup(null)}
      />
    </>
  );
};
