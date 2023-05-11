import { Icon } from '~/components';
import { StyledButton } from './styles';

interface IRefreshButtonProps {
  onClick: () => void;
  className?: string;
}

const RefreshButton: React.FC<IRefreshButtonProps> = ({
  onClick,
  className,
}) => {
  return (
    <StyledButton onClick={onClick} className={className}>
      <Icon name="Refresh" />
    </StyledButton>
  );
};

export default RefreshButton;
