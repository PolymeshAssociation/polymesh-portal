import { useState } from 'react';
import { ErrorMessage } from '~/layouts/AssetManager/components/AssetControlCenter/styles';
import { ExtrinsicPermissionScopeType } from '~/layouts/SecondaryKeys/types';
import {
  FormSection,
  Label,
  SelectWrapper,
  ViewToggleContainer,
  ViewToggleLabel,
  ViewToggleTab,
} from '../styles';
import { ExtrinsicPermissionSelector } from './ExtrinsicPermissionSelector';
import { ModulePermissionSelector } from './ModulePermissionSelector';
import { PermissionTypeSelect } from './PermissionTypeSelect';

interface IExtrinsicsPermissionsProps {
  value: {
    type: ExtrinsicPermissionScopeType;
    values: Array<{ pallet: string; extrinsics?: string[] | null }>;
  };
  onChange: (
    type: ExtrinsicPermissionScopeType,
    values: Array<{ pallet: string; extrinsics?: string[] | null }>,
  ) => void;
  validationError?: string;
}

const TRANSACTION_PERMISSION_OPTIONS = [
  {
    type: 'None' as const,
    title: 'No access to any functions',
    description: 'The key cannot execute any transactions on the blockchain',
  },
  {
    type: 'Whole' as const,
    title: 'Full access to all functions',
    description: 'The key can execute any transaction on the blockchain',
  },
  {
    type: 'These' as const,
    title: 'Access to specific modules and/or methods',
    description: 'Select which blockchain functions the key can execute',
  },
];

export const ExtrinsicsPermissions = ({
  value,
  onChange,
  validationError,
}: IExtrinsicsPermissionsProps) => {
  const [viewMode, setViewMode] = useState<'groups' | 'modules'>('groups');

  const handleTypeChange = (type: ExtrinsicPermissionScopeType) => {
    onChange(type, type === 'Whole' || type === 'None' ? [] : value.values);
  };

  const handleExtrinsicsChange = (
    extrinsics: Array<{ pallet: string; extrinsics?: string[] | null }>,
  ) => {
    onChange(value.type, extrinsics);
  };

  return (
    <FormSection>
      <PermissionTypeSelect
        value={value.type as string}
        onChange={(type) =>
          handleTypeChange(type as ExtrinsicPermissionScopeType)
        }
        options={
          TRANSACTION_PERMISSION_OPTIONS as ReadonlyArray<{
            readonly type: string;
            readonly title: string;
            readonly description: string;
          }>
        }
        label="Transaction Access"
      />

      {value.type === 'These' && (
        <SelectWrapper>
          <Label>Select functions to allow</Label>
          <ViewToggleContainer>
            <ViewToggleLabel>View by:</ViewToggleLabel>
            <ViewToggleTab
              type="button"
              $active={viewMode === 'groups'}
              onClick={() => setViewMode('groups')}
            >
              Transaction Groups
            </ViewToggleTab>
            <ViewToggleTab
              type="button"
              $active={viewMode === 'modules'}
              onClick={() => setViewMode('modules')}
            >
              Blockchain Modules
            </ViewToggleTab>
          </ViewToggleContainer>
          {viewMode === 'groups' ? (
            <ExtrinsicPermissionSelector
              selectedExtrinsics={value.values}
              onChange={handleExtrinsicsChange}
            />
          ) : (
            <ModulePermissionSelector
              selectedExtrinsics={value.values}
              onChange={handleExtrinsicsChange}
            />
          )}
          {validationError && <ErrorMessage>{validationError}</ErrorMessage>}
        </SelectWrapper>
      )}
    </FormSection>
  );
};
