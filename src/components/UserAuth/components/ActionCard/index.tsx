import { StyledActionCard } from './styles';

interface IActionCardProps {
  children: React.ReactNode | React.ReactNode[];
  hovered?: boolean;
}

export const ActionCard = ({ children, hovered = false }: IActionCardProps) => {
  return <StyledActionCard $hovered={hovered}>{children}</StyledActionCard>;
};
