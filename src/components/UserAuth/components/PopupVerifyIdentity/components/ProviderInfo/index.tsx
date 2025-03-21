import { useContext, useEffect, useMemo, useState } from 'react';
import { CopyToClipboard as ReactCopyToClipboard } from 'react-copy-to-clipboard';
import QRCode from 'react-qr-code';
import { Icon } from '~/components';
import { Heading, Text } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import {
  FINCLUSIVE_BUSINESS_IDENTITY_PROVIDER,
  MOCKID_IDENTITY_PROVIDER,
  NETKI_IDENTITY_PROVIDER,
} from '~/context/AuthContext/constants';
import { formatDid } from '~/helpers/formatters';
import { useWindowWidth } from '~/hooks/utility';
import {
  IDENTITY_PROVIDERS,
  IDENTITY_PROVIDER_FINCLUSIVE_KYB,
  IDENTITY_PROVIDER_MOCK,
  TIdentityProvider,
} from '../../../../constants';
import { ActionCard } from '../../../ActionCard';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { SecondaryButton } from '../../../SecondaryButton';
import { fetchIdentityProviderLink, fetchMockCdd } from './helpers';
import {
  StyledProviderContainer,
  StyledProviderInfo,
  StyledProviderName,
  StyledProviderNameContainer,
  StyledProviderStepsList,
  StyledQRCode,
  StyledQRCodeContainer,
} from './styles';

interface IProvideInfoProps {
  providerName: TIdentityProvider;
  applicationUrl?: string;
}

export const ProviderInfo = ({
  providerName,
  applicationUrl,
}: IProvideInfoProps) => {
  const [providerLink, setProviderLink] = useState('');

  const { selectedAccount, refreshAccountIdentity, identity } =
    useContext(AccountContext);
  const { setIdentityPopup } = useAuthContext();
  const { isMobile } = useWindowWidth();

  let provider;
  if (providerName === MOCKID_IDENTITY_PROVIDER) {
    provider = IDENTITY_PROVIDER_MOCK;
  } else if (providerName === FINCLUSIVE_BUSINESS_IDENTITY_PROVIDER) {
    provider = IDENTITY_PROVIDER_FINCLUSIVE_KYB;
  } else {
    provider = IDENTITY_PROVIDERS[providerName];
  }

  const handleOpenProviderDesktop = () => {
    if (!providerLink) return;
    window.open(providerLink, '_blank');
  };

  useEffect(() => {
    (async () => {
      if (providerName === MOCKID_IDENTITY_PROVIDER) {
        const isCddCreated = await fetchMockCdd(selectedAccount);
        if (isCddCreated) {
          refreshAccountIdentity();
        }
        return;
      }
      if (applicationUrl) {
        setProviderLink(applicationUrl);
        return;
      }
      const isBusiness = providerName === FINCLUSIVE_BUSINESS_IDENTITY_PROVIDER;
      const data = await fetchIdentityProviderLink(
        selectedAccount,
        provider.link,
        isBusiness,
      );
      refreshAccountIdentity();
      setProviderLink(data.link);
    })();
  }, [
    applicationUrl,
    provider.link,
    providerName,
    refreshAccountIdentity,
    selectedAccount,
  ]);

  const getGoBackType = useMemo(() => {
    if (providerName === MOCKID_IDENTITY_PROVIDER) {
      return null;
    }
    return applicationUrl ? 'pending' : 'providers';
  }, [providerName, applicationUrl]);

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
                  {provider.name} on your phone
                  {!isMobile &&
                    providerName !== NETKI_IDENTITY_PROVIDER &&
                    ' or continue with desktop'}
                  .
                </Text>
              ) : (
                <Text>
                  {identity?.did
                    ? `DID ${formatDid(identity.did)} has been assigned to this address. You can now close this popup`
                    : 'A DID and CDD claim are being created for the selected address'}
                </Text>
              )}
            </StyledProviderName>
          </StyledProviderNameContainer>
          {!!provider.steps.length && (
            <ActionCard>
              <Heading type="h5" fontWeight={600}>
                You will be asked to:
              </Heading>
              <StyledProviderStepsList>
                {provider.steps.map((step) => (
                  <li key={step}>
                    <Text>{step}</Text>
                  </li>
                ))}
              </StyledProviderStepsList>
            </ActionCard>
          )}
        </StyledProviderInfo>
        {providerName !== MOCKID_IDENTITY_PROVIDER && providerLink && (
          <StyledQRCodeContainer>
            <ReactCopyToClipboard text={providerLink}>
              <StyledQRCode>
                {providerLink && (
                  <QRCode size={128} value={providerLink} level="L" />
                )}
              </StyledQRCode>
            </ReactCopyToClipboard>
            <Text centered>
              Scan QR code with your phone,{' '}
              {(isMobile || providerName !== NETKI_IDENTITY_PROVIDER) && (
                <>
                  or click{' '}
                  <SecondaryButton
                    label="HERE"
                    labelSize="medium"
                    handleClick={handleOpenProviderDesktop}
                  />{' '}
                  to proceed on this device{' '}
                </>
              )}
              or click on it to copy the url to your clipboard.
            </Text>
          </StyledQRCodeContainer>
        )}
      </StyledProviderContainer>
      <PopupActionButtons
        goBackLabel={
          providerName === MOCKID_IDENTITY_PROVIDER ? 'Close' : 'Back'
        }
        onGoBack={() =>
          setIdentityPopup({
            type: getGoBackType,
          })
        }
      />
    </>
  );
};
