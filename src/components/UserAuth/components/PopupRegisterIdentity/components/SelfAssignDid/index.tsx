import { useContext, useEffect, useState } from 'react';
import { Icon } from '~/components';
import { Heading, SkeletonLoader, Text } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { formatDid } from '~/helpers/formatters';
import { notifyError } from '~/helpers/notifications';
import { onboardAccount } from '~/helpers/onboarding';
import { PopupActionButtons } from '../../../PopupActionButtons';
import {
  StyledSelfAssignContainer,
  StyledSelfAssignInfo,
  StyledSelfAssignStatus,
} from './styles';

type SelfAssignState =
  | 'ready'
  | 'signing'
  | 'submitting'
  | 'requesting'
  | 'success';

export const SelfAssignDid = () => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { selectedAccount, refreshAccountIdentity, identity } =
    useContext(AccountContext);
  const { executeTransaction } = useTransactionStatusContext();
  const { setShowIdentityPopup } = useAuthContext();

  const [state, setState] = useState<SelfAssignState>(
    identity?.did ? 'success' : 'ready',
  );
  const [isTestnet, setIsTestnet] = useState<boolean | null>(null);

  useEffect(() => {
    if (!sdk) return;
    (async () => {
      const { name } = await sdk.network.getNetworkProperties();
      setIsTestnet(!name.includes('Mainnet'));
    })();
  }, [sdk]);

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

  const handleTestnetOnboard = async () => {
    if (!selectedAccount) return;

    setState('requesting');

    try {
      await onboardAccount(selectedAccount);
      refreshAccountIdentity();
      setState('success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Onboarding failed';
      setState('ready');
      notifyError(msg);
    }
  };

  const handleRegisterDid = () => {
    if (isTestnet) {
      return handleTestnetOnboard();
    }
    return handleSelfAssign();
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

    if (state === 'requesting') {
      return (
        <StyledSelfAssignInfo>
          <Text size="medium" color="secondary">
            Requesting your DID and testnet POLYX from the onboarding service.
            This may take a moment...
          </Text>
        </StyledSelfAssignInfo>
      );
    }

    if (isTestnet === null) {
      return (
        <StyledSelfAssignInfo>
          <SkeletonLoader height={100} />
        </StyledSelfAssignInfo>
      );
    }

    if (isTestnet) {
      return (
        <StyledSelfAssignInfo>
          <Text size="medium">
            Create a Decentralized Identity (DID) on the Polymesh testnet. This
            is a free service — no POLYX is needed to cover the transaction fee
            on testnet.
          </Text>
          <Text size="medium">
            You will also receive testnet POLYX tokens to use for testing
            transactions on the network.
          </Text>
        </StyledSelfAssignInfo>
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

  const isProcessing =
    state === 'signing' || state === 'submitting' || state === 'requesting';

  let proceedLabel = 'Create DID';
  if (state === 'signing') {
    proceedLabel = 'Awaiting Signature...';
  } else if (state === 'submitting') {
    proceedLabel = 'Submitting Transaction...';
  } else if (state === 'requesting') {
    proceedLabel = 'Requesting DID...';
  }

  return (
    <>
      <StyledSelfAssignContainer>{renderContent()}</StyledSelfAssignContainer>
      <PopupActionButtons
        proceedLabel={proceedLabel}
        goBackLabel="Close"
        canProceed={!isProcessing && isTestnet !== null}
        onProceed={
          state === 'success' || identity?.did ? undefined : handleRegisterDid
        }
        onGoBack={() => setShowIdentityPopup(false)}
      />
    </>
  );
};
