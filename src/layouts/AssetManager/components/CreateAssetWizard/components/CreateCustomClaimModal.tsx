import React, { useContext } from 'react';
import styled from 'styled-components';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { UnsubCallback } from '@polymeshassociation/polymesh-sdk/types';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatus } from '~/hooks/polymesh';
import { notifyError } from '~/helpers/notifications';

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
  const { handleStatusChange } = useTransactionStatus();

  const handleCreateClaim = async () => {
    if (!sdk) return;
    let unsubCb: UnsubCallback | undefined;
    try {
      const registerCustomClaimTx = await sdk.claims.registerCustomClaimType({
        name: customClaimName,
      });
      onClose();

      unsubCb = registerCustomClaimTx.onStatusChange((transaction) =>
        handleStatusChange(transaction),
      );

      const newClaimId = await registerCustomClaimTx.run();

      onSuccess({ id: newClaimId, name: customClaimName });
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      if (unsubCb) {
        unsubCb();
      }
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
        <Button variant="modalPrimary" onClick={handleCreateClaim}>
          Create
        </Button>
      </StyledButtonsWrapper>
    </Modal>
  );
};

export default CreateCustomClaimModal;
