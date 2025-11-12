import {
  FormSection,
  RadioGroup,
  RadioOption,
  RadioLabel,
  RadioTitle,
  RadioDescription,
  SelectWrapper,
  Label,
} from '../styles';
import { ExtrinsicPermissionSelector } from './ExtrinsicPermissionSelector';

interface IExtrinsicsPermissionsProps {
  value: {
    type: 'Whole' | 'These' | 'None';
    values: Array<{ pallet: string; extrinsics?: string[] }>;
  };
  onChange: (
    type: 'Whole' | 'These' | 'None',
    values: Array<{ pallet: string; extrinsics?: string[] }>
  ) => void;
}

export const ExtrinsicsPermissions = ({
  value,
  onChange,
}: IExtrinsicsPermissionsProps) => {
  const handleTypeChange = (type: 'Whole' | 'These' | 'None') => {
    onChange(type, type === 'Whole' || type === 'None' ? [] : value.values);
  };

  const handleExtrinsicsChange = (
    extrinsics: Array<{ pallet: string; extrinsics?: string[] }>
  ) => {
    onChange(value.type, extrinsics);
  };

  return (
    <FormSection>
      <RadioGroup>
        <RadioOption>
          <input
            type="radio"
            name="extrinsicsPermission"
            checked={value.type === 'Whole'}
            onChange={() => handleTypeChange('Whole')}
          />
          <RadioLabel>
            <RadioTitle>Full access to all functions</RadioTitle>
            <RadioDescription>
              The key can execute any transaction on the blockchain
            </RadioDescription>
          </RadioLabel>
        </RadioOption>

        <RadioOption>
          <input
            type="radio"
            name="extrinsicsPermission"
            checked={value.type === 'None'}
            onChange={() => handleTypeChange('None')}
          />
          <RadioLabel>
            <RadioTitle>No access to any functions</RadioTitle>
            <RadioDescription>
              The key cannot execute any transactions on the blockchain
            </RadioDescription>
          </RadioLabel>
        </RadioOption>

        <RadioOption>
          <input
            type="radio"
            name="extrinsicsPermission"
            checked={value.type === 'These'}
            onChange={() => handleTypeChange('These')}
          />
          <RadioLabel>
            <RadioTitle>Access to specific modules and/or methods</RadioTitle>
            <RadioDescription>
              Select which blockchain functions the key can execute
            </RadioDescription>
          </RadioLabel>
        </RadioOption>
      </RadioGroup>

      {value.type === 'These' && (
        <SelectWrapper>
          <Label>Select functions to allow</Label>
          <ExtrinsicPermissionSelector
            selectedExtrinsics={value.values}
            onChange={handleExtrinsicsChange}
          />
        </SelectWrapper>
      )}
    </FormSection>
  );
};
