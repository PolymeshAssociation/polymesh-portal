import { Text } from '~/components/UiKit';
import { StyledLabel, StyledInput, CheckboxFrame } from './styles';

interface IDefaultCheckboxProps {
  onChange: React.ChangeEventHandler;
  disabled: boolean;
}

const id = 'select-default-wallet';

export const DefaultSelectionCheckbox: React.FC<IDefaultCheckboxProps> = ({
  onChange,
  disabled,
}) => {
  return (
    <StyledLabel htmlFor={id} disabled={disabled}>
      <StyledInput
        id={id}
        type="checkbox"
        onChange={onChange}
        disabled={disabled}
      />
      <CheckboxFrame>
        <div className="checkbox-icon" />
      </CheckboxFrame>
      <Text size="large" color="secondary">
        Save selection as my default
      </Text>
    </StyledLabel>
  );
};
