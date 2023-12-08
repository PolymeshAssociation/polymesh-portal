import { StyledButtonContainer } from './styles';

interface IButtonContainerProps {
  children: React.ReactNode | React.ReactNode[];
}

export const ButtonContainer: React.FC<IButtonContainerProps> = ({
  children,
}) => <StyledButtonContainer>{children}</StyledButtonContainer>;
