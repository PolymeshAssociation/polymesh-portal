import { useState, useEffect, useContext } from 'react';
import QRCode from 'react-qr-code';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { MOCKID_IDENTITY_PROVIDER } from '~/context/AuthContext/constants';
import { Text, Heading } from '~/components/UiKit';
import { Icon } from '~/components';
import {
  TIdentityProviderNames,
  IDENTITY_PROVIDERS,
} from '../../../../constants';
import { ActionCard } from '../../../ActionCard';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { SecondaryButton } from '../../../SecondaryButton';
import { fetchIdentityProviderLink } from './helpers';
import {
  StyledProviderContainer,
  StyledProviderInfo,
  StyledProviderNameContainer,
  StyledProviderName,
  StyledProviderStepsList,
} from './styles';

interface IProvideInfoProps {
  providerName: TIdentityProviderNames;
}

export const ProviderInfo = ({ providerName }: IProvideInfoProps) => {
  const [providerLink, setProviderLink] = useState('');

  const { selectedAccount, refreshAccountIdentity } =
    useContext(AccountContext);
  const { setIdentityPopup } = useAuthContext();

  const provider = IDENTITY_PROVIDERS[providerName];

  const handleOpenProviderDesktop = () => {
    if (!providerLink) return;
    window.open(providerLink, '_blank');
  };

  useEffect(() => {
    (async () => {
      const data = await fetchIdentityProviderLink(
        selectedAccount,
        provider.link,
      );
      if (providerName === MOCKID_IDENTITY_PROVIDER) {
        refreshAccountIdentity();
        return;
      }
      setProviderLink(data.link);
    })();
  }, [provider.link, providerName, refreshAccountIdentity, selectedAccount]);

  return (
    <>
      <StyledProviderContainer>
        <StyledProviderInfo>
          <StyledProviderNameContainer>
            <Icon name={provider.icon} size="88px" />
            <StyledProviderName>
              <Heading type="h4">{provider.name}</Heading>
              {providerName !== MOCKID_IDENTITY_PROVIDER ? (
                <Text size="large">
                  Please use the QR Code to continue verification with{' '}
                  {provider.name} <br /> on your phone or continue with desktop.
                </Text>
              ) : (
                <Text>
                  This will create a CDD claim for the address without verifying
                  any documents. <br />
                  Mock CDD is for testing purposes only and is not available for
                  mainnet.
                </Text>
              )}
            </StyledProviderName>
          </StyledProviderNameContainer>
          {providerName !== MOCKID_IDENTITY_PROVIDER && providerLink && (
            <>
              <Text>Scan QR code with your phone to continue</Text>
              {providerLink && <QRCode value={providerLink} />}
              <Text>
                Proceed with{' '}
                <SecondaryButton
                  label="desktop experience"
                  labelSize="medium"
                  handleClick={handleOpenProviderDesktop}
                />{' '}
                instead
              </Text>
            </>
          )}
        </StyledProviderInfo>
        {!!provider.steps.length && (
          <ActionCard>
            <Heading type="h4">You will be asked to:</Heading>
            <StyledProviderStepsList>
              {provider.steps.map((step) => (
                <li key={step}>
                  <Text>{step}</Text>
                </li>
              ))}
            </StyledProviderStepsList>
          </ActionCard>
        )}
      </StyledProviderContainer>
      <PopupActionButtons onGoBack={() => setIdentityPopup(null)} />
    </>
  );
};
