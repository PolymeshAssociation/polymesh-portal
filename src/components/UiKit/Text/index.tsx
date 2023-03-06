import { StyledText } from './styles';
import { ITextProps, ETextSize } from './types';

const Text: React.FC<ITextProps> = ({
  centered,
  marginTop,
  marginBottom,
  width,
  color,
  size = ETextSize.MEDIUM,
  bold,
  children,
}) => {
  return (
    <StyledText
      centered={centered}
      marginTop={marginTop}
      marginBottom={marginBottom}
      width={width}
      color={color}
      size={size}
      bold={bold}
    >
      {children}
    </StyledText>
  );
};

export default Text;
