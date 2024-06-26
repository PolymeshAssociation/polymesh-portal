import { Text } from '~/components/UiKit';
import { StyledInputContainer, StyledInput } from './styles';

interface ICustomInputProps {
  placeholder: string;
  value: string;
  label?: string;
  error?: string;
  isBig?: boolean;
  handleChange: (value: string) => void;
}

export const CustomInput = ({
  placeholder,
  value,
  label = '',
  error = '',
  isBig = false,
  handleChange,
}: ICustomInputProps) => {
  return (
    <StyledInputContainer>
      {label && <Text bold>{label}</Text>}
      <StyledInput
        $isBig={isBig}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
      {error && <Text size="small">{error}</Text>}
    </StyledInputContainer>
  );
};
