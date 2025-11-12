import { ErrorMessage } from '~/layouts/AssetManager/components/AssetControlCenter/styles';
import { PermissionScopeType } from '../../../types';
import { FormSection, Label, SelectWrapper } from '../styles';
import { PermissionTypeSelect } from './PermissionTypeSelect';
import { PortfolioPermissionSelector } from './PortfolioPermissionSelector';

interface IPortfoliosPermissionsProps {
  value: {
    type: PermissionScopeType;
    values: Array<{ id: string; name?: string }>;
  };
  onChange: (
    type: PermissionScopeType,
    values: Array<{ id: string; name?: string }>,
  ) => void;
  validationError?: string;
}

const PORTFOLIO_PERMISSION_OPTIONS = [
  {
    type: 'None' as PermissionScopeType,
    title: 'No access to any portfolios',
    description: 'The key cannot access any portfolios',
  },
  {
    type: 'Whole' as PermissionScopeType,
    title: 'Full access to all portfolios',
    description:
      'The key can access and manage all current and future portfolios',
  },
  {
    type: 'These' as PermissionScopeType,
    title: 'Access to specific portfolios only',
    description: 'Select which portfolios the key can access',
  },
  {
    type: 'Except' as PermissionScopeType,
    title: 'Access to all except specific portfolios',
    description:
      'The key can access all portfolios except the ones you specify',
  },
] as const;

export const PortfoliosPermissions = ({
  value,
  onChange,
  validationError,
}: IPortfoliosPermissionsProps) => {
  const handleTypeChange = (type: PermissionScopeType) => {
    onChange(type, type === 'Whole' || type === 'None' ? [] : value.values);
  };

  const handleItemsChange = (items: Array<{ id: string; name?: string }>) => {
    onChange(value.type, items);
  };

  const shouldShowSelector = value.type === 'These' || value.type === 'Except';

  return (
    <FormSection>
      <PermissionTypeSelect
        value={value.type}
        onChange={(type) => handleTypeChange(type as PermissionScopeType)}
        options={PORTFOLIO_PERMISSION_OPTIONS}
        label="Portfolio Access"
      />

      {shouldShowSelector && (
        <SelectWrapper>
          <Label>
            {value.type === 'These'
              ? 'Select portfolios to allow'
              : 'Select portfolios to exclude'}
          </Label>
          <PortfolioPermissionSelector
            selectedPortfolios={value.values}
            onChange={handleItemsChange}
          />
          {validationError && <ErrorMessage>{validationError}</ErrorMessage>}
        </SelectWrapper>
      )}
    </FormSection>
  );
};
