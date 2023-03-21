import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { StyledBackdrop, StyledModal } from './styles';

interface IModalProps {
  handleClose: () => void;
  children: React.ReactNode;
}

const modalRoot = document.getElementById('modal-root');

const Modal: React.FC<IModalProps> = ({ handleClose, children }) => {
  // Disabling page scroll when modal is open
  useEffect(() => {
    document.body.classList.add('no-scroll');

    return () => document.body.classList.remove('no-scroll');
  }, []);

  const handleBackdropClick: React.ReactEventHandler = (event) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    handleClose();
  };

  useEffect(() => {
    const handleCloseOnEsc = (event: React.KeyboardEvent) => {
      if (event.code !== 'Escape') {
        return;
      }
      handleClose();
    };

    window.addEventListener('keydown', handleCloseOnEsc);

    return () => {
      window.removeEventListener('keydown', handleCloseOnEsc);
    };
  }, [handleClose]);

  return createPortal(
    <StyledBackdrop onClick={handleBackdropClick}>
      <StyledModal>{children}</StyledModal>
    </StyledBackdrop>,
    modalRoot,
  );
};

export default Modal;
