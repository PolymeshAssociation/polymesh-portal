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
  matomoData,
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
      matomoData={matomoData}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
