import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { Text, Heading } from '~/components/UiKit';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { StyledInfoContainer, StyledLink } from './styles';

export const PendingInfo = () => {
  const { setIdentityPopup } = useAuthContext();
  const { selectedAccount } = useContext(AccountContext);

  return (
    <>
      <Heading type="h4">Existing Applications Found</Heading>
      <div>
        <Text>
          There are already existing CDD applications bound to this address:{' '}
        </Text>
        <Text bold color="secondary">
          {selectedAccount}
        </Text>
      </div>
      <Text>
        It usually takes up to 2 business days for CDD provider to verify your
        identity.
      </Text>
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
        If you wish you can proceed by creating a new CDD application.
      </Text>
      <PopupActionButtons
        onProceed={() => setIdentityPopup('providers')}
        onGoBack={() => setIdentityPopup(null)}
        proceedLabel="Create New Application"
      />
    </>
  );
};
