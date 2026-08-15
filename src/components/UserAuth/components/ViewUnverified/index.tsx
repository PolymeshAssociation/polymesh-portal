import { useContext } from 'react';
import { Icon } from '~/components';
import { Text } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { EActionButtonStatus } from '../../constants';
import {
  StyledAuthButtons,
  StyledAuthHeader,
  StyledAuthHeaderWrap,
  StyledCloseButton,
} from '../../styles';
import { ActionButton } from '../ActionButton';
import { NewsletterSignup } from '../NewsletterSignup';
import { PopupWelcome } from '../PopupWelcome';

export const ViewUnverified = () => {
  const { selectedAccount } = useContext(AccountContext);
  const { setConnectPopup, setShowIdentityPopup, setShowAuth } =
    useAuthContext();

  return (
    <>
      <PopupWelcome />

      <StyledAuthHeaderWrap>
        <StyledAuthHeader>Get Started with Polymesh</StyledAuthHeader>
        {selectedAccount && (
          <StyledCloseButton onClick={() => setShowAuth(false)}>
            <Icon name="CloseCircledIcon" size="24px" />
          </StyledCloseButton>
        )}
      </StyledAuthHeaderWrap>

      <StyledAuthButtons>
        <ActionButton
          title={selectedAccount ? 'Step 1 (Complete)' : 'Step 1'}
          label="Connect Wallet"
          icon="ConnectWalletIcon"
          status={
            selectedAccount
              ? EActionButtonStatus.ACTION_DONE
              : EActionButtonStatus.ACTION_ACTIVE
          }
          handleClick={() => setConnectPopup('extensions')}
        />
        <ActionButton
          title="Step 2"
          label="Register Decentralized Identity"
          icon="ConnectIdentityIcon"
          status={
            selectedAccount
              ? EActionButtonStatus.ACTION_ACTIVE
              : EActionButtonStatus.ACTION_DISABLED
          }
          handleClick={() => setShowIdentityPopup(true)}
        />
      </StyledAuthButtons>

      {selectedAccount && (
        <Text size="medium" marginBottom={8}>
          <strong>* Identity registration is optional:</strong> You can send and
          receive POLYX and participate in staking without a registered
          identity. A DID is required for asset management, portfolios, and
          other identity-related features.
        </Text>
      )}

      {selectedAccount && <NewsletterSignup variant="inline" compact />}
    </>
  );
};
