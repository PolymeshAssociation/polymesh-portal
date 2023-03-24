import { Icon } from '~/components';
import { StyledButton } from './styles';

interface IToastCloseProps {
  closeToast?: () => void;
}

const ToastCloseButton: React.FC<IToastCloseProps> = ({ closeToast }) => {
  return (
    <StyledButton onClick={closeToast} className="toast-close">
      <Icon name="CloseIcon" />
    </StyledButton>
  );
};

export default ToastCloseButton;
