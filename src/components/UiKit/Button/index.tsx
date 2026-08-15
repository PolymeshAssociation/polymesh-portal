import { StyledButton } from './styles';
import { EButtonVariants, IButtonProps } from './types';

const Button: React.FC<IButtonProps> = ({
  variant = EButtonVariants.PRIMARY,
  marginTop,
  marginBottom,
  children,
  onClick,
  disabled,
  className,
  round,
  square,
  title,
}) => {
  return (
    <StyledButton
      $variant={variant}
      $marginTop={marginTop}
      $marginBottom={marginBottom}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      $round={round}
      $square={square}
      title={title}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
