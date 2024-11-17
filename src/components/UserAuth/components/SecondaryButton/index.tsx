import { Text } from '~/components/UiKit';
import { StyledSecondaryButton } from './styles';
import { MatomoData } from '~/helpers/matomo';

interface ISecondaryButtonProps {
  label: string;
  labelSize?: 'large' | 'medium' | 'small';
  underlined?: boolean;
  handleClick: () => void;
  matomoData?: MatomoData;
}

export const SecondaryButton = ({
  label,
  labelSize = 'medium',
  underlined = false,
  handleClick,
  matomoData,
}: ISecondaryButtonProps) => {
  return (
    <StyledSecondaryButton
      $underlined={underlined}
      onClick={handleClick}
      data-event-category={matomoData?.eventCategory}
      data-event-action={matomoData?.eventAction}
      data-event-name={matomoData?.eventName}
    >
      <Text size={labelSize} bold>
        {label}
      </Text>
    </StyledSecondaryButton>
  );
};
