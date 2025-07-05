import React, { useContext } from 'react';
import styled from 'styled-components';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
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
          onTransactionRunning: () => {
            onClose();
          },
          onSuccess: async (transactionResult) => {
            const newClaimId = transactionResult;
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
      <Text marginTop={32} marginBottom={50}>
        Custom claim &quot;{customClaimName}&quot; does not exist. Would you
        like to create it?
      </Text>
      <StyledButtonsWrapper>
        <Button variant="modalSecondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          onClick={handleCreateClaim}
          disabled={isTransactionInProgress}
        >
          Create
        </Button>
      </StyledButtonsWrapper>
    </Modal>
  );
};

export default CreateCustomClaimModal;
