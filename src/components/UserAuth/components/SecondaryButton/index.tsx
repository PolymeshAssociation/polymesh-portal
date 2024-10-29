import { Text } from '~/components/UiKit';
import { StyledSecondaryButton } from './styles';

interface ISecondaryButtonProps {
  label: string;
  labelSize?: 'large' | 'medium' | 'small';
  underlined?: boolean;
  handleClick: () => void;
  [key: string]: any; // Accept any additional props
}

export const SecondaryButton = ({
  label,
  labelSize = 'medium',
  underlined = false,
  handleClick,
  ...props
}: ISecondaryButtonProps) => {
  return (
    <StyledSecondaryButton
      $underlined={underlined}
      onClick={handleClick}
      {...props}
>
      <Text size={labelSize} bold>
        {label}
      </Text>
    </StyledSecondaryButton>
  );
};
