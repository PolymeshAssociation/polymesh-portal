import { Icon } from '~/components';
import { StyledButton } from './styles';

interface IRefreshButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const RefreshButton: React.FC<IRefreshButtonProps> = ({
  onClick,
  className,
  disabled,
}) => {
  return (
    <StyledButton
      onClick={onClick}
      className={className}
      type="button"
      disabled={disabled}
    >
      <Icon name="Refresh" />
    </StyledButton>
  );
};

export default RefreshButton;
