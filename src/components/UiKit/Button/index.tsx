import { StyledButton } from './styles';
import { IButtonProps } from './types';

const Button: React.FC<IButtonProps> = ({
  variant,
  marginTop,
  marginBottom,
  children,
  onClick,
}) => {
  return (
    <StyledButton
      variant={variant}
      marginTop={marginTop}
      marginBottom={marginBottom}
      type="button"
      onClick={onClick}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
