import { ErrorMessage } from '~/layouts/AssetManager/components/AssetControlCenter/styles';
import { PermissionScopeType } from '../../../types';
import { AssetDetails } from '../../../utils';
import { FormSection, Label, SelectWrapper } from '../styles';
import { AssetPermissionSelector } from './AssetPermissionSelector';
import { PermissionTypeSelect } from './PermissionTypeSelect';

interface IAssetsPermissionsProps {
  value: {
    type: PermissionScopeType;
    values: string[];
  };
  onChange: (type: PermissionScopeType, values: string[]) => void;
  validationError?: string;
  resolvedAssets: AssetDetails[];
  onResolveAsset: (asset: AssetDetails) => void;
}

const ASSET_PERMISSION_OPTIONS = [
  {
    type: 'None' as PermissionScopeType,
    title: 'No access to any assets',
    description: 'The key cannot interact with any assets',
  },
  {
    type: 'Whole' as PermissionScopeType,
    title: 'Full access to all assets',
    description: 'The key can interact with all current and future assets',
  },
  {
    type: 'These' as PermissionScopeType,
    title: 'Access to specific assets only',
    description: 'Select which assets the key can interact with',
  },
  {
    type: 'Except' as PermissionScopeType,
    title: 'Access to all except specific assets',
    description: 'The key can access all assets except the ones you specify',
  },
] as const;

export const AssetsPermissions = ({
  value,
  onChange,
  validationError,
  resolvedAssets,
  onResolveAsset,
}: IAssetsPermissionsProps) => {
  const handleTypeChange = (type: PermissionScopeType) => {
    onChange(type, type === 'Whole' || type === 'None' ? [] : value.values);
  };

  const handleItemsChange = (items: string[]) => {
    onChange(value.type, items);
  };

  const shouldShowSelector = value.type === 'These' || value.type === 'Except';

  return (
    <FormSection>
      <PermissionTypeSelect
        value={value.type}
        onChange={(type) => handleTypeChange(type as PermissionScopeType)}
        options={ASSET_PERMISSION_OPTIONS}
        label="Asset Access"
      />

      {shouldShowSelector && (
        <SelectWrapper>
          <Label>
            {value.type === 'These'
              ? 'Select assets to allow'
              : 'Select assets to exclude'}
          </Label>
          <AssetPermissionSelector
            selectedAssets={value.values}
            onChange={handleItemsChange}
            resolvedAssets={resolvedAssets}
            onResolveAsset={onResolveAsset}
          />
          {validationError && <ErrorMessage>{validationError}</ErrorMessage>}
        </SelectWrapper>
      )}
    </FormSection>
  );
};
