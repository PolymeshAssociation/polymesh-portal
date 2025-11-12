import { useCallback } from 'react';
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
import { AssetPermissionSelector } from './AssetPermissionSelector';

interface IAssetsPermissionsProps {
  value: {
    type: 'Whole' | 'These' | 'Except' | 'None';
    values: string[];
  };
  onChange: (
    type: 'Whole' | 'These' | 'Except' | 'None',
    values: string[],
  ) => void;
}

export const AssetsPermissions = ({
  value,
  onChange,
}: IAssetsPermissionsProps) => {
  const handleTypeChange = useCallback((type: 'Whole' | 'These' | 'Except' | 'None') => {
    onChange(type, type === 'Whole' ? [] : value.values);
  }, [onChange, value.values]);

  const handleAssetsChange = useCallback((assets: string[]) => {
    onChange(value.type, assets);
  }, [onChange, value.type]);

  return (
    <FormSection>
      <RadioGroup>
        <RadioOption>
          <input
            type="radio"
            name="assetsPermission"
            checked={value.type === 'Whole'}
            onChange={() => handleTypeChange('Whole')}
          />
          <RadioLabel>
            <RadioTitle>Full access to all assets</RadioTitle>
            <RadioDescription>
              The key can interact with all current and future assets
            </RadioDescription>
          </RadioLabel>
        </RadioOption>

        <RadioOption>
          <input
            type="radio"
            name="assetsPermission"
            checked={value.type === 'These'}
            onChange={() => handleTypeChange('These')}
          />
          <RadioLabel>
            <RadioTitle>Access to specific assets only</RadioTitle>
            <RadioDescription>
              Select which assets the key can interact with
            </RadioDescription>
          </RadioLabel>
        </RadioOption>

        <RadioOption>
          <input
            type="radio"
            name="assetsPermission"
            checked={value.type === 'Except'}
            onChange={() => handleTypeChange('Except')}
          />
          <RadioLabel>
            <RadioTitle>Access to all except specific assets</RadioTitle>
            <RadioDescription>
              The key can access all assets except the ones you specify
            </RadioDescription>
          </RadioLabel>
        </RadioOption>
      </RadioGroup>

      {(value.type === 'These' || value.type === 'Except') && (
        <SelectWrapper>
          <Label>
            {value.type === 'These'
              ? 'Select assets to allow'
              : 'Select assets to exclude'}
          </Label>
          <AssetPermissionSelector
            selectedAssets={value.values}
            onChange={handleAssetsChange}
          />
        </SelectWrapper>
      )}
    </FormSection>
  );
};
