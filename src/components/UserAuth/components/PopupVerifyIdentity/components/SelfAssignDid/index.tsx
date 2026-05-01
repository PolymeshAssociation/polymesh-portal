import { useContext, useState } from 'react';
import { Icon } from '~/components';
import { Heading, Text } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { formatDid } from '~/helpers/formatters';
import { notifyError } from '~/helpers/notifications';
import { PopupActionButtons } from '../../../PopupActionButtons';
import {
  StyledSelfAssignContainer,
  StyledSelfAssignInfo,
  StyledSelfAssignStatus,
} from './styles';

type SelfAssignState = 'ready' | 'signing' | 'submitting' | 'success';

export const SelfAssignDid = () => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { selectedAccount, refreshAccountIdentity, identity } =
    useContext(AccountContext);
  const { executeTransaction } = useTransactionStatusContext();
  const { setIdentityPopup } = useAuthContext();

  const [state, setState] = useState<SelfAssignState>(
    identity?.did ? 'success' : 'ready',
  );

  const createOptions = (
    onTransactionRunning?: () => void | Promise<void>,
    onSuccess?: () => void | Promise<void>,
  ) => ({
    onTransactionRunning,
    onSuccess: async () => {
      if (onSuccess) {
        await onSuccess();
      }
    },
    onError: (error: Error) => {
      const msg = error.message || 'Transaction failed';
      setState('ready');
      notifyError(msg);
    },
  });

  const handleSelfAssign = async () => {
    if (!sdk || !selectedAccount) return;

    setState('signing');

    try {
      const selfRegisterDidTx = sdk.identities.selfRegisterDid();

      await executeTransaction(
        selfRegisterDidTx,
        createOptions(
          () => setState('submitting'),
          () => {
            refreshAccountIdentity();
            setState('success');
          },
        ),
      );
    } catch (error) {
      // Error handling is done in transaction options onError callback.
    }
  };

  const renderContent = () => {
    if (state === 'success' || identity?.did) {
      return (
        <StyledSelfAssignStatus>
          <Icon name="Check" size="64px" className="success-icon" />
          <Heading type="h4">DID Created Successfully</Heading>
          <Text size="medium">
            Your DID{' '}
            <strong>{identity?.did ? formatDid(identity.did) : ''}</strong> has
            been assigned. You can now close this popup and start using identity
            features.
          </Text>
        </StyledSelfAssignStatus>
      );
    }

    return (
      <StyledSelfAssignInfo>
        <Text size="medium">
          Create a Decentralized Identity (DID) on Polymesh. This is a one-time
          on-chain transaction that assigns a unique identity to your account.
        </Text>
        <Text size="medium">
          A DID is required for asset management, portfolio features, and other
          identity-related functionality on Polymesh. Sending and receiving
          POLYX and staking do not require a DID.
        </Text>
        <Text size="medium" color="secondary">
          A small transaction fee in POLYX will be charged for creating your
          DID.
        </Text>
      </StyledSelfAssignInfo>
    );
  };

  let proceedLabel = 'Create DID';
  if (state === 'signing') {
    proceedLabel = 'Awaiting Signature...';
  } else if (state === 'submitting') {
    proceedLabel = 'Submitting Transaction...';
  }

  return (
    <>
      <StyledSelfAssignContainer>{renderContent()}</StyledSelfAssignContainer>
      <PopupActionButtons
        proceedLabel={proceedLabel}
        goBackLabel="Close"
        canProceed={state !== 'signing' && state !== 'submitting'}
        onProceed={
          state === 'success' || identity?.did ? undefined : handleSelfAssign
        }
        onGoBack={() => setIdentityPopup({ type: null })}
        matomoData={{
          eventCategory: 'onboarding',
          eventAction: 'self-assign-did',
          eventName: 'v8-self-assign',
        }}
      />
    </>
  );
};
