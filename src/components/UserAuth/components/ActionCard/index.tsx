import { StyledActionCard } from './styles';

interface IActionCardProps {
  children: React.ReactNode | React.ReactNode[];
  hovered?: boolean;
  [key: string]: any; // Accept any additional props
}

export const ActionCard = ({ children, hovered = false, ...props }: IActionCardProps) => {
  return <StyledActionCard $hovered={hovered} {...props}>{children}</StyledActionCard>;
};
