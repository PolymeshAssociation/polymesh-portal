import { StyledText } from './styles';
import { ITextProps, ETextSize, ETextColor } from './types';

const Text: React.FC<ITextProps> = ({
  centered,
  marginTop,
  marginBottom,
  width,
  color = ETextColor.PRIMARY,
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
