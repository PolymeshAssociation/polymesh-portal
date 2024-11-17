import clsx from 'clsx';
import { Icon } from '~/components';
import { StyledButton } from './styles';

interface IToastCloseProps {
  closeToast?: () => void;
}

const ToastCloseButton: React.FC<IToastCloseProps> = ({ closeToast }) => {
  return (
    <StyledButton onClick={closeToast} className={clsx('toast-close')}>
      <Icon name="CloseIcon" size="16px" />
    </StyledButton>
  );
};

export default ToastCloseButton;
