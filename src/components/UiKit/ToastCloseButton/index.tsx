import { Icon } from '~/components';
import { StyledButton } from './styles';

const ToastCloseButton = ({ closeToast }) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledButton onClick={closeToast} className="toast-close">
      <Icon name="CloseIcon" />
    </StyledButton>
  );
};

export default ToastCloseButton;
