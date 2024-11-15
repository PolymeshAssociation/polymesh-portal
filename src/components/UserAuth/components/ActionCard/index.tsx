import { StyledActionCard } from './styles';
import { MatomoData } from '~/helpers/matomoTags';

interface IActionCardProps {
  children: React.ReactNode | React.ReactNode[];
  hovered?: boolean;
  matomoData?: MatomoData;
}

export const ActionCard = ({ children, hovered = false, matomoData = undefined }: IActionCardProps) => {
  return <StyledActionCard $hovered={hovered} matomoData={matomoData}>{children}</StyledActionCard>;
};
