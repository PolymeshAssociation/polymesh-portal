import { useContext } from 'react';
import { Icon } from '~/components';
import { Text } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { EKeyIdentityStatus } from '~/context/AccountContext/constants';
import { useAuthContext } from '~/context/AuthContext';
import { PolymeshContext } from '~/context/PolymeshContext';
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
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);
  const { selectedAccount, keyCddVerificationInfo } =
    useContext(AccountContext);
  const { setConnectPopup, setIdentityPopup, setShowAuth } = useAuthContext();

  const getIdentityButtonStatus = () => {
    if (
      polkadotApi?.genesisHash.toString() !== import.meta.env.VITE_GENESIS_HASH
    ) {
      return EActionButtonStatus.ACTION_DISABLED;
    }
    if (keyCddVerificationInfo?.status === EKeyIdentityStatus.PENDING) {
      return EActionButtonStatus.ACTION_PENDING;
    }
    if (!selectedAccount) {
      return EActionButtonStatus.ACTION_DISABLED;
    }
    return EActionButtonStatus.ACTION_ACTIVE;
  };

  return (
    <>
      <PopupWelcome />

      <StyledAuthHeaderWrap>
        <StyledAuthHeader>Get Started with Polymesh</StyledAuthHeader>
        {selectedAccount && (
          <StyledCloseButton
            onClick={() => setShowAuth(false)}
            data-event-category="onboarding"
            data-event-action="close"
            data-event-name="unverified-view"
          >
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
          matomoData={{
            eventCategory: 'onboarding',
            eventAction: 'connect-wallet',
            eventName: 'unverified-view',
          }}
          handleClick={() => setConnectPopup('extensions')}
        />
        <ActionButton
          title={
            keyCddVerificationInfo?.status === EKeyIdentityStatus.PENDING
              ? 'Step 2 (In Progress)'
              : 'Step 2'
          }
          label="Verify Identity*"
          icon="ConnectIdentityIcon"
          status={getIdentityButtonStatus()}
          data-event-category="onboarding"
          matomoData={{
            eventCategory: 'onboarding',
            eventAction: 'verify-identity',
            eventName: 'unverified-view',
          }}
          handleClick={() =>
            setIdentityPopup({
              type:
                keyCddVerificationInfo?.status === EKeyIdentityStatus.PENDING
                  ? 'pending'
                  : 'providers',
            })
          }
        />
      </StyledAuthButtons>

      {selectedAccount && (
        <Text size="medium" marginBottom={8}>
          <strong>* Identity verification is optional:</strong> You can send and
          receive POLYX and participate in staking, as a nominator, without
          Identity verification. Identity verification is required for assets
          and identity-related features.
        </Text>
      )}

      {selectedAccount && <NewsletterSignup variant="inline" compact />}
    </>
  );
};
