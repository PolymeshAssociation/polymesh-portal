import React from 'react';
import { Modal } from '~/components';
import { Heading, Text } from '~/components/UiKit';
import { ModalContainer, ModalContent } from '../../styles';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  feature = 'feature',
}) => {
  if (!isOpen) return null;

  return (
    <Modal handleClose={onClose}>
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={16}>
            Coming Soon
          </Heading>
          <Text size="large" marginBottom={16}>
            The {feature} functionality is currently under development and will
            be available in a future release.
          </Text>
          <Text size="large">Stay tuned for updates!</Text>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
