import React from 'react';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';

import { ModalContainer, ModalContent, ModalActions } from '../../styles';

interface IMintNftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionInProcess: boolean;
}

export const MintNftsModal: React.FC<IMintNftsModalProps> = ({
  isOpen,
  onClose,
  transactionInProcess,
}) => {
  if (!isOpen) return null;

  return (
    <Modal handleClose={onClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Mint NFTs
          </Heading>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100px',
              textAlign: 'center',
            }}
          >
            <Heading type="h5">Coming Soon</Heading>
          </div>

          <ModalActions>
            <Button
              variant="modalSecondary"
              onClick={onClose}
              disabled={transactionInProcess}
            >
              Close
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
