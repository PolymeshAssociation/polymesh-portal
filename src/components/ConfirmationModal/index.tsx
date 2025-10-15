import React from 'react';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import {
  ModalActions,
  ModalContainer,
  ModalContent,
} from '~/layouts/AssetManager/components/AssetControlCenter/styles';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isProcessing?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isProcessing = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal handleClose={onClose} customWidth="500px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            {title}
          </Heading>
          <Text marginBottom={24}>{message}</Text>
          <ModalActions>
            <Button
              variant="modalSecondary"
              onClick={onClose}
              disabled={isProcessing}
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={handleConfirm}
              variant="modalPrimary"
              disabled={isProcessing}
            >
              {confirmLabel}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
