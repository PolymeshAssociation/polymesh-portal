import { useContext, useEffect, useState } from 'react';
import { useAuthContext } from '~/context/AuthContext';
import {
  FINCLUSIVE_BUSINESS_IDENTITY_PROVIDER,
  FRACTAL_IDENTITY_PROVIDER,
  MOCKID_IDENTITY_PROVIDER,
  TIdentityModalType,
} from '~/context/AuthContext/constants';
import { PolymeshContext } from '~/context/PolymeshContext';
import {
  IDENTITY_PROVIDERS,
  IDENTITY_PROVIDER_MOCK,
} from '../../../../constants';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { SecondaryButton } from '../../../SecondaryButton';
import { ProviderCard } from '../ProviderCard';
import {
  StyleProviderBox,
  StyledProvidersContainer,
  StyledTestnetContainer,
  StyledTestnetList,
} from './styles';

const isProviderEnabled = (envVar: string | undefined): boolean => {
  return envVar?.toLowerCase() === 'true';
};

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
      if (chainNetwork.name.includes('Mainnet')) {
        setIsTestnet(false);
      } else {
        setIsTestnet(true);
      }
    })();
  }, [sdk]);

  const providerEnabledMap: Record<string, boolean> = {
    jumio: isProviderEnabled(
      import.meta.env.VITE_PROVIDER_JUMIO_ENABLED ?? 'true',
    ),
    netki: isProviderEnabled(
      import.meta.env.VITE_PROVIDER_NETKI_ENABLED ?? 'true',
    ),
    finclusive: isProviderEnabled(
      import.meta.env.VITE_PROVIDER_FINCLUSIVE_ENABLED ?? 'true',
    ),
    // Assuming MockID is always enabled for testnet
    mockid: true,
  };

  const renderProviders = () => {
    if (isTestnet) {
      const mockProviderDisabled = !providerEnabledMap.mockid; // Use dot notation
      return (
        <StyledTestnetContainer>
          <StyleProviderBox
            key={MOCKID_IDENTITY_PROVIDER}
            onClick={() => {
              if (!mockProviderDisabled) {
                setIdentityPopup({
                  type: MOCKID_IDENTITY_PROVIDER,
                });
              }
            }}
          >
            <ProviderCard
              provider={IDENTITY_PROVIDER_MOCK}
              isTestnet={isTestnet as boolean}
              disabled={mockProviderDisabled}
            />
          </StyleProviderBox>
          <StyledTestnetList>
            {Object.entries(IDENTITY_PROVIDERS).map(
              ([provider, providerDetails]) => {
                if (
                  provider === FRACTAL_IDENTITY_PROVIDER ||
                  provider === FINCLUSIVE_BUSINESS_IDENTITY_PROVIDER
                )
                  return null;
                const isDisabled = !providerEnabledMap[provider.toLowerCase()]; // Determine disabled state
                return (
                  <StyleProviderBox
                    key={providerDetails.name}
                    onClick={() => {
                      if (!isDisabled) {
                        setIdentityPopup({
                          type: provider as TIdentityModalType,
                        });
                      }
                    }}
                  >
                    <ProviderCard
                      provider={providerDetails}
                      isTestnet={isTestnet as boolean}
                      disabled={isDisabled}
                    />
                  </StyleProviderBox>
                );
              },
            )}
          </StyledTestnetList>
        </StyledTestnetContainer>
      );
    }
    return (
      <StyledProvidersContainer>
        {Object.entries(IDENTITY_PROVIDERS).map(
          ([provider, providerDetails]) => {
            if (
              provider === FRACTAL_IDENTITY_PROVIDER ||
              provider === FINCLUSIVE_BUSINESS_IDENTITY_PROVIDER
            )
              return null;
            const isDisabled = !providerEnabledMap[provider.toLowerCase()]; // Determine disabled state
            return (
              <StyleProviderBox
                key={providerDetails.name}
                onClick={() => {
                  if (!isDisabled) {
                    setIdentityPopup({
                      type: provider as TIdentityModalType,
                    });
                  }
                }}
              >
                <ProviderCard
                  provider={providerDetails}
                  isTestnet={isTestnet as boolean}
                  disabled={isDisabled}
                />
              </StyleProviderBox>
            );
          },
        )}
      </StyledProvidersContainer>
    );
  };

  return (
    <>
      {isTestnet !== null && renderProviders()}
      <SecondaryButton
        label="I need to onboard as a business"
        handleClick={() =>
          setIdentityPopup({
            type: 'business-providers' as TIdentityModalType,
          })
        }
      />
      <PopupActionButtons
        goBackLabel="Close"
        onGoBack={() => setIdentityPopup({ type: null })}
      />
    </>
  );
};
