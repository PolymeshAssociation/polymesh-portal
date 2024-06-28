import { useState, useEffect, useContext } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useAuthContext } from '~/context/AuthContext';
import {
  TIdentityModalType,
  FRACTAL_IDENTITY_PROVIDER,
} from '~/context/AuthContext/constants';
import {
  IDENTITY_PROVIDERS,
  IDENTITY_PROVIDER_MOCK,
} from '../../../../constants';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { SecondaryButton } from '../../../SecondaryButton';
import { ProviderCard } from '../ProviderCard';
import {
  StyledProvidersContainer,
  StyleProviderBox,
  StyledTestnetContainer,
  StyledTestnetList,
} from './styles';

export const ProviderSelect = () => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { setIdentityPopup } = useAuthContext();

  const [isTestnet, setIsTestnet] = useState<null | boolean>(null);

  useEffect(() => {
    if (!sdk) return;

    (async () => {
      const chainNetwork = await sdk.network.getNetworkProperties();
      if (chainNetwork.name.includes('Testnet')) {
        setIsTestnet(true);
      } else {
        setIsTestnet(false);
      }
    })();
  }, [sdk]);

  const renderProviders = () => {
    if (isTestnet) {
      return (
        <StyledTestnetContainer>
          <StyleProviderBox
            key={IDENTITY_PROVIDER_MOCK.name}
            onClick={() =>
              setIdentityPopup(
                IDENTITY_PROVIDER_MOCK.name as TIdentityModalType,
              )
            }
          >
            <ProviderCard
              provider={IDENTITY_PROVIDER_MOCK}
              isTestnet={isTestnet as boolean}
            />
          </StyleProviderBox>
          <StyledTestnetList>
            {Object.values(IDENTITY_PROVIDERS).map((provider) => {
              if (provider.name === FRACTAL_IDENTITY_PROVIDER) return null;
              return (
                <StyleProviderBox
                  key={provider.name}
                  onClick={() =>
                    setIdentityPopup(provider.name as TIdentityModalType)
                  }
                >
                  <ProviderCard
                    provider={provider}
                    isTestnet={isTestnet as boolean}
                  />
                </StyleProviderBox>
              );
            })}
          </StyledTestnetList>
        </StyledTestnetContainer>
      );
    }
    return (
      <StyledProvidersContainer>
        {Object.values(IDENTITY_PROVIDERS).map((provider) => {
          return (
            <StyleProviderBox
              key={provider.name}
              onClick={() =>
                setIdentityPopup(provider.name as TIdentityModalType)
              }
            >
              <ProviderCard
                provider={provider}
                isTestnet={isTestnet as boolean}
              />
            </StyleProviderBox>
          );
        })}
      </StyledProvidersContainer>
    );
  };

  return (
    <>
      {/* <StyledProvidersContainer> */}
      {isTestnet !== null && renderProviders()}
      {/* </StyledProvidersContainer> */}
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
