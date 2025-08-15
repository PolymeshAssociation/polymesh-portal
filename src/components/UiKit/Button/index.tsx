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
      $square={square}
      data-event-category={matomoData?.eventCategory}
      data-event-action={matomoData?.eventAction}
      data-event-name={matomoData?.eventName}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
