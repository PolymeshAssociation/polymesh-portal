import { Text } from '~/components/UiKit';
import { StyledSecondaryButton } from './styles';
import { MatomoData } from '~/helpers/matomoTags';

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
  matomoData = undefined,
}: ISecondaryButtonProps) => {
  return (
    <StyledSecondaryButton
      $underlined={underlined}
      onClick={handleClick}
      matomoData={matomoData}
>
      <Text size={labelSize} bold>
        {label}
      </Text>
    </StyledSecondaryButton>
  );
};
