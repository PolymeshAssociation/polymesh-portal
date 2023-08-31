import { StyledHeading } from './styles';
import { IHeadingProps, EHeadingCases, EHeadingTypes } from './types';

const Heading: React.FC<IHeadingProps> = ({
  type = EHeadingTypes.H1,
  centered,
  marginTop,
  marginBottom,
  transform = EHeadingCases.DEFAULT,
  children,
}) => {
  return (
    <StyledHeading
      as={type}
      $centered={centered}
      $marginTop={marginTop}
      $marginBottom={marginBottom}
      $transform={transform}
    >
      {children}
    </StyledHeading>
  );
};

export default Heading;
