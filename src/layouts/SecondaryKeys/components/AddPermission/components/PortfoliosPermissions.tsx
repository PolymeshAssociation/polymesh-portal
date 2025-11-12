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
import { PortfolioPermissionSelector } from './PortfolioPermissionSelector';

interface IPortfoliosPermissionsProps {
  value: {
    type: 'Whole' | 'These' | 'Except' | 'None';
    values: string[];
  };
  onChange: (type: 'Whole' | 'These' | 'Except' | 'None', values: string[]) => void;
}

export const PortfoliosPermissions = ({
  value,
  onChange,
}: IPortfoliosPermissionsProps) => {
  const handleTypeChange = (type: 'Whole' | 'These' | 'Except' | 'None') => {
    onChange(type, type === 'Whole' ? [] : value.values);
  };

  const handlePortfoliosChange = (
    portfolios: Array<{ id: string; name?: string }>
  ) => {
    // Extract just the portfolio IDs (not the full DID/ID format)
    const uniqueIds = [...new Set(portfolios.map((p) => p.id))];
    onChange(value.type, uniqueIds);
  };

  // Convert string[] to portfolio objects for the selector
  // Extract portfolio ID from "DID/portfolioId" format if present
  const selectedPortfolios = value.values.map((value) => {
    // Check if value is in "DID/portfolioId" format
    const parts = value.split('/');
    const id = parts.length === 2 ? parts[1] : value;
    return { id };
  }).filter((item, index, self) => 
    // Remove duplicates
    index === self.findIndex((t) => t.id === item.id)
  );

  return (
    <FormSection>
      <RadioGroup>
        <RadioOption>
          <input
            type="radio"
            name="portfoliosPermission"
            checked={value.type === 'Whole'}
            onChange={() => handleTypeChange('Whole')}
          />
          <RadioLabel>
            <RadioTitle>Full access to all portfolios</RadioTitle>
            <RadioDescription>
              The key can access and manage all current and future portfolios
            </RadioDescription>
          </RadioLabel>
        </RadioOption>

        <RadioOption>
          <input
            type="radio"
            name="portfoliosPermission"
            checked={value.type === 'These'}
            onChange={() => handleTypeChange('These')}
          />
          <RadioLabel>
            <RadioTitle>Access to specific portfolios only</RadioTitle>
            <RadioDescription>
              Select which portfolios the key can access
            </RadioDescription>
          </RadioLabel>
        </RadioOption>

        <RadioOption>
          <input
            type="radio"
            name="portfoliosPermission"
            checked={value.type === 'Except'}
            onChange={() => handleTypeChange('Except')}
          />
          <RadioLabel>
            <RadioTitle>Access to all except specific portfolios</RadioTitle>
            <RadioDescription>
              The key can access all portfolios except the ones you specify
            </RadioDescription>
          </RadioLabel>
        </RadioOption>
      </RadioGroup>

      {(value.type === 'These' || value.type === 'Except') && (
        <SelectWrapper>
          <Label>
            {value.type === 'These'
              ? 'Select portfolios to allow'
              : 'Select portfolios to exclude'}
          </Label>
          <PortfolioPermissionSelector
            selectedPortfolios={selectedPortfolios}
            onChange={handlePortfoliosChange}
          />
        </SelectWrapper>
      )}
    </FormSection>
  );
};
