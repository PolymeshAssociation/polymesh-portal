import { StyledActionCard } from './styles';
import { MatomoData } from '~/helpers/matomo';

interface IActionCardProps {
  children: React.ReactNode | React.ReactNode[];
  hovered?: boolean;
  matomoData?: MatomoData;
}

export const ActionCard = ({
  children,
  hovered = false,
  matomoData = undefined,
}: IActionCardProps) => {
  return (
    <StyledActionCard
      $hovered={hovered}
      data-event-category={matomoData?.eventCategory}
      data-event-action={matomoData?.eventAction}
      data-event-name={matomoData?.eventName}
    >
      {children}
    </StyledActionCard>
  );
};
