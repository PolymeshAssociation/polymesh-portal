import { useContext, useEffect, useState } from 'react';
import Icon from '~/components/Icon';
import { Heading, Text } from '~/components/UiKit';
import { useAuthContext } from '~/context/AuthContext';
import {
  FINCLUSIVE_BUSINESS_IDENTITY_PROVIDER,
  MOCKID_IDENTITY_PROVIDER,
  TIdentityModalType,
} from '~/context/AuthContext/constants';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useWindowWidth } from '~/hooks/utility';
import {
  IDENTITY_PROVIDER_FINCLUSIVE_KYB,
  IDENTITY_PROVIDER_MOCK,
} from '../../../../constants';
import { ActionCard } from '../../../ActionCard';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { SecondaryButton } from '../../../SecondaryButton';
import { ProviderCard } from '../ProviderCard';
import {
  StyledProviderContainer,
  StyledProviderInfo,
  StyledProviderRegList,
} from '../ProviderCard/styles';
import {
  StyleProviderBox,
  StyledProvidersContainer,
  StyledTestnetContainer,
  StyledTestnetList,
} from './styles';

const isProviderEnabled = (envVar: string | undefined): boolean => {
  return envVar?.toLowerCase() === 'true';
};

export const BusinessProviderSelect = () => {
  const { windowWidth } = useWindowWidth();

  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { setIdentityPopup } = useAuthContext();

  const [isTestnet, setIsTestnet] = useState<null | boolean>(null);

  const providerEnabledMap: Record<string, boolean> = {
    mockid: true,
    finclusive_kyb: isProviderEnabled(
      import.meta.env.VITE_PROVIDER_FINCLUSIVE_KYB_ENABLED ?? 'true',
    ),
  };

  const handleContactFormClick = () => {
    window.open('https://polymesh.network/contact-us', '_blank');
  };

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

  const renderFinclusiveKyb = () => {
    const isDisabled = !providerEnabledMap.finclusive_kyb;
    return (
      <StyleProviderBox
        key={IDENTITY_PROVIDER_FINCLUSIVE_KYB.name}
        onClick={() => {
          if (!isDisabled) {
            setIdentityPopup({
              type: FINCLUSIVE_BUSINESS_IDENTITY_PROVIDER,
            });
          }
        }}
      >
        <ProviderCard
          provider={IDENTITY_PROVIDER_FINCLUSIVE_KYB}
          isTestnet={isTestnet as boolean}
          disabled={isDisabled}
        />
      </StyleProviderBox>
    );
  };

  const renderContactUs = () => {
    return (
      <StyleProviderBox key="Contact Us" onClick={handleContactFormClick}>
        <ActionCard hovered>
          <StyledProviderContainer>
            <Icon
              name="PolymeshLogo"
              size={windowWidth > 420 ? '88px' : '60px'}
            />
            <StyledProviderInfo>
              <Heading type="h4">Contact Us</Heading>
              <div>
                <StyledProviderRegList>
                  <li>
                    <Text size="small">
                      Please complete our{' '}
                      <SecondaryButton
                        label="contact form"
                        labelSize="small"
                        handleClick={handleContactFormClick}
                        matomoData={{
                          eventCategory: 'onboarding',
                          eventAction: 'cdd-select',
                          eventName: 'business-form',
                        }}
                      />{' '}
                      to indicate your desire to onboard your business to
                      Polymesh.
                    </Text>
                  </li>
                  <li>
                    <Text size="small">
                      To expedite the process, include &quot;Business
                      onboarding&quot; in the &quot;Why are you reaching
                      out?&quot; section.
                    </Text>
                  </li>
                  <li>
                    <Text size="small">
                      A representative will then contact you with the next
                      steps.
                    </Text>
                  </li>
                </StyledProviderRegList>
              </div>
            </StyledProviderInfo>
          </StyledProviderContainer>
        </ActionCard>
      </StyleProviderBox>
    );
  };

  const renderProviders = () => {
    if (isTestnet) {
      const mockProviderDisabled = !providerEnabledMap.mockid;
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
          <StyledTestnetList>{renderFinclusiveKyb()}</StyledTestnetList>
        </StyledTestnetContainer>
      );
    }
    return (
      <StyledProvidersContainer>
        {renderFinclusiveKyb()}
        {renderContactUs()}
      </StyledProvidersContainer>
    );
  };

  return (
    <>
      {isTestnet !== null && renderProviders()}
      <SecondaryButton
        label="I need to onboard as an individual"
        handleClick={() =>
          setIdentityPopup({
            type: 'providers' as TIdentityModalType,
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
