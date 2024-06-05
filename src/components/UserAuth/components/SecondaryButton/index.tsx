import { Text } from '~/components/UiKit';
import { StyledSecondaryButton } from './styles';

interface ISecondaryButtonProps {
  label: string;
  labelSize?: 'large' | 'medium' | 'small';
  underlined?: boolean;
  handleClick: () => void;
}
export const SecondaryButton = ({
  label,
  labelSize = 'medium',
  underlined = false,
  handleClick,
}: ISecondaryButtonProps) => {
  return (
    <StyledSecondaryButton $underlined={underlined} onClick={handleClick}>
      <Text size={labelSize} bold>
        {label}
      </Text>
    </StyledSecondaryButton>
  );
};
