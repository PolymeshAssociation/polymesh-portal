import { Text } from '~/components/UiKit';
import { StyledInputContainer, StyledInput } from './styles';

interface ICustomInputProps {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  handleChange: (value: string) => void;
}

export const CustomInput = ({
  label,
  placeholder,
  value,
  error,
  handleChange,
}: ICustomInputProps) => {
  return (
    <StyledInputContainer>
      <Text bold>{label}</Text>
      <StyledInput
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
      {error && <Text>{error}</Text>}
    </StyledInputContainer>
  );
};

CustomInput.defaultProps = {
  error: '',
};
