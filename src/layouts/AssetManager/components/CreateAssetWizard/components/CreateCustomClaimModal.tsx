import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { MultiSigProposal } from '@polymeshassociation/polymesh-sdk/internal';
import React, { useContext } from 'react';
import styled from 'styled-components';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';

const StyledButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
`;

interface CreateCustomClaimModalProps {
  customClaimName: string;
  onClose: () => void;
  onSuccess: (claim: { id: BigNumber; name: string }) => void;
}

const CreateCustomClaimModal: React.FC<CreateCustomClaimModalProps> = ({
  customClaimName,
  onClose,
  onSuccess,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { accountIsMultisigSigner } = useContext(AccountContext);
  const { executeTransaction, isTransactionInProgress } =
    useTransactionStatusContext();

  const handleCreateClaim = async () => {
    if (!sdk) return;

    try {
      await executeTransaction(
        sdk.claims.registerCustomClaimType({
          name: customClaimName,
        }),
        {
          runAsMultiSigProposal: 'auto',
          onTransactionRunning: () => {
            onClose();
          },
          onSuccess: async (transactionResult) => {
            // Check if this is a multisig proposal or direct execution
            if (transactionResult instanceof MultiSigProposal) {
              // This is a MultiSigProposal
              // The claim doesn't exist yet, so we can't add it to the form
              // User will need to come back after approval
              return;
            }

            // Direct execution - transactionResult is the BigNumber claim ID
            const newClaimId = transactionResult as BigNumber;
            onSuccess({ id: newClaimId, name: customClaimName });
          },
        },
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  return (
    <Modal handleClose={onClose}>
      <Heading type="h4">Create Custom Claim</Heading>
      <Text marginTop={32}>
        Custom claim &quot;{customClaimName}&quot; does not exist.
        {accountIsMultisigSigner
          ? ' Creating it will require a multisig proposal.'
          : ' Would you like to create it?'}
      </Text>

      {accountIsMultisigSigner && (
        <Text marginTop={16}>
          <strong>Note:</strong> Since you are connected with a multisig signer
          key, creating this custom claim will generate a proposal that requires
          approval from other signers. The claim will <strong>not</strong> be
          available immediately. Once approved, you can return to this step and
          look up the claim by name or ID to use it.
        </Text>
      )}

      <StyledButtonsWrapper>
        <Button variant="modalSecondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          onClick={handleCreateClaim}
          disabled={isTransactionInProgress}
        >
          {accountIsMultisigSigner ? 'Create Proposal' : 'Create'}
        </Button>
      </StyledButtonsWrapper>
    </Modal>
  );
};

export default CreateCustomClaimModal;
