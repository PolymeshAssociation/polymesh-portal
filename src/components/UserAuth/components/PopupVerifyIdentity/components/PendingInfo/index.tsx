import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { Text, Heading } from '~/components/UiKit';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { StyledInfoContainer, StyledLink } from './styles';
import ApplicationTable from './components/ApplicationsTable';

export const PendingInfo = () => {
  const { setIdentityPopup } = useAuthContext();
  const { keyCddVerificationInfo } = useContext(AccountContext);

  const applications = keyCddVerificationInfo?.applications;

  if (!applications) {
    return (
      <>
        <Heading type="h4">No Existing Applications Found</Heading>
        <StyledInfoContainer>
          <Text>
            There are no existing identity verification applications linked to
            the selected key.
          </Text>
        </StyledInfoContainer>
        <Text bold>
          If you wish you can proceed by creating a new application.
        </Text>
        <PopupActionButtons
          onProceed={() => setIdentityPopup({ type: 'providers' })}
          onGoBack={() => setIdentityPopup({ type: null })}
          proceedLabel="Create New Application"
        />
        <div />
      </>
    );
  }

  return (
    <>
      <Heading type="h4">Existing Applications Found</Heading>
      <StyledInfoContainer>
        {applications.length === 1 ? (
          <Text>
            There is an existing identity verification application linked to the
            selected key.
          </Text>
        ) : (
          <Text>
            There are existing identity verification applications linked to the
            selected key.
          </Text>
        )}
      </StyledInfoContainer>
      <StyledInfoContainer>
        <Text>
          If you previously selected an identity verification provider without
          fully completing the identity verification process, you can access the
          previous link by clicking the corresponding Application ID below.
        </Text>
      </StyledInfoContainer>
      <ApplicationTable applications={applications!} />
      <StyledInfoContainer>
        <Text>
          Once your completed application is submitted it usually takes up to 2
          business days for provider to verify your identity.
        </Text>
      </StyledInfoContainer>
      <StyledInfoContainer>
        <Text>
          After 2 business days, if your identity is still not verified, please
          email{' '}
          <StyledLink href="mailto:support@polymesh.network">
            support@polymesh.network
          </StyledLink>{' '}
          with your Polymesh key address and the identity verification provider
          that you selected.
        </Text>
      </StyledInfoContainer>
      <Text bold>
        If you wish you can proceed by creating a new application.
      </Text>
      <PopupActionButtons
        onProceed={() => setIdentityPopup({ type: 'providers' })}
        onGoBack={() => setIdentityPopup({ type: null })}
        proceedLabel="Create New Application"
      />
      <div />
    </>
  );
};
