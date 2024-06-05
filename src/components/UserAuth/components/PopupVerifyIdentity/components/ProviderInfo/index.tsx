import { useState, useEffect, useContext, useMemo } from 'react';
import QRCode from 'react-qr-code';
import { CopyToClipboard as ReactCopyToClipboard } from 'react-copy-to-clipboard';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import {
  MOCKID_IDENTITY_PROVIDER,
  NETKI_IDENTITY_PROVIDER,
} from '~/context/AuthContext/constants';
import { formatDid } from '~/helpers/formatters';
import { Text, Heading } from '~/components/UiKit';
import { Icon } from '~/components';
import {
  TIdentityProvider,
  IDENTITY_PROVIDERS,
  IDENTITY_PROVIDER_MOCK,
} from '../../../../constants';
import { ActionCard } from '../../../ActionCard';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { SecondaryButton } from '../../../SecondaryButton';
import { fetchIdentityProviderLink, fetchMockCdd } from './helpers';
import {
  StyledProviderContainer,
  StyledProviderInfo,
  StyledProviderNameContainer,
  StyledProviderName,
  StyledProviderStepsList,
  StyledQRCode,
} from './styles';
import { useWindowWidth } from '~/hooks/utility';

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

  const provider =
    providerName === MOCKID_IDENTITY_PROVIDER
      ? IDENTITY_PROVIDER_MOCK
      : IDENTITY_PROVIDERS[providerName];

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
      const data = await fetchIdentityProviderLink(
        selectedAccount,
        provider.link,
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
          {providerName !== MOCKID_IDENTITY_PROVIDER && providerLink && (
            <>
              <Text>
                Scan QR code with your phone,{' '}
                {(isMobile || providerName !== NETKI_IDENTITY_PROVIDER) && (
                  <>
                    click{' '}
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
              <ReactCopyToClipboard text={providerLink}>
                <StyledQRCode>
                  {providerLink && <QRCode value={providerLink} />}
                </StyledQRCode>
              </ReactCopyToClipboard>
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
