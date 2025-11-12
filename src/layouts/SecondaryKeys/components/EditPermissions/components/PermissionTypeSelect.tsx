import {
  PermissionDescription,
  PermissionSelectDropdown,
  PermissionSelectLabel,
  PermissionSelectWrapper,
} from '../styles';

interface IPermissionTypeSelectProps {
  value: string;
  onChange: (type: string) => void;
  options: ReadonlyArray<{
    readonly type: string;
    readonly title: string;
    readonly description: string;
  }>;
  label: string;
}

export const PermissionTypeSelect = ({
  value,
  onChange,
  options,
  label,
}: IPermissionTypeSelectProps) => {
  const selectedOption = options.find((opt) => opt.type === value);

  return (
    <PermissionSelectWrapper>
      <PermissionSelectLabel htmlFor="permission-select">
        {label}
      </PermissionSelectLabel>
      <PermissionSelectDropdown
        id="permission-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.type} value={option.type}>
            {option.title}
          </option>
        ))}
      </PermissionSelectDropdown>
      {selectedOption && (
        <PermissionDescription>
          {selectedOption.description}
        </PermissionDescription>
      )}
    </PermissionSelectWrapper>
  );
};
