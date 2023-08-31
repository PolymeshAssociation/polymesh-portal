import { StyledCheckboxWrapper, HiddenInput } from './styles';

interface ITogglerProps {
  id: string;
  isEnabled: boolean;
  handleChange: (
    state: boolean,
  ) => void | React.Dispatch<React.SetStateAction<boolean>>;
}

const Toggler: React.FC<ITogglerProps> = ({ id, isEnabled, handleChange }) => {
  return (
    <StyledCheckboxWrapper htmlFor={id} $isEnabled={isEnabled}>
      <HiddenInput
        type="checkbox"
        id={id}
        onChange={({ target }) => handleChange(target.checked)}
      />
    </StyledCheckboxWrapper>
  );
};

export default Toggler;
