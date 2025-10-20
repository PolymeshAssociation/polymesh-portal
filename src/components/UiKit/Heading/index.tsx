import { StyledHeading } from './styles';
import { EHeadingCases, EHeadingTypes, IHeadingProps } from './types';

const Heading: React.FC<IHeadingProps> = ({
  type = EHeadingTypes.H1,
  centered,
  marginTop,
  marginBottom,
  color,
  transform = EHeadingCases.DEFAULT,
  children,
}) => {
  return (
    <StyledHeading
      as={type}
      $centered={centered}
      $marginTop={marginTop}
      $marginBottom={marginBottom}
      $color={color}
      $transform={transform}
    >
      {children}
    </StyledHeading>
  );
};

export default Heading;
