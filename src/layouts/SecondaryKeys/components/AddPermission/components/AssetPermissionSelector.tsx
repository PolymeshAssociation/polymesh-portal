import { useContext, useState, useEffect, useRef } from 'react';
import { AssetContext } from '~/context/AssetContext';
import { Icon } from '~/components';
import { formatUuid, stringToColor } from '~/helpers/formatters';
import styled from 'styled-components';

interface IAssetPermissionSelectorProps {
  selectedAssets: string[];
  onChange: (assets: string[]) => void;
}

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledSelect = styled.button<{ $expanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: all 250ms ease-out;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }

  .expand-icon {
    transform: ${({ $expanded }) => ($expanded ? 'rotate(180deg)' : 'rotate(0)')};
    transition: transform 250ms ease-out;
  }
`;

const StyledExpandedSelect = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  box-shadow: 0px 8px 16px ${({ theme }) => theme.colors.shadow};
  z-index: 10;
`;

const StyledOption = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 250ms ease-out;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.lightAccent : 'transparent'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverBackground};
  }

  &:first-child {
    border-radius: 12px 12px 0 0;
  }

  &:last-child {
    border-radius: 0 0 12px 12px;
  }
`;

const IconWrapper = styled.div<{ $background: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ $background }) => $background};
  flex-shrink: 0;
`;

const StyledPlaceholder = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;

  &:focus {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.colors.textPink};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SelectedCount = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const AssetIdSection = styled.div`
  margin-top: 16px;
`;

const AssetIdLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
  display: block;
`;

const AssetIdInputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const AssetIdInput = styled.input<{ $hasError?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ theme, $hasError }) => 
    $hasError ? theme.colors.error : theme.colors.border};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  transition: border-color 250ms ease-out;

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.error : theme.colors.textPink};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const AddButton = styled.button`
  padding: 12px 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 250ms ease-out;
  white-space: nowrap;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.textPrimary};
    background-color: ${({ theme }) => theme.colors.hoverBackground};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
`;

const SelectedAssetsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const SelectedAssetItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: ${({ theme }) => theme.colors.lightAccent};
  border-radius: 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0;
  transition: color 250ms ease-out;

  &:hover {
    color: ${({ theme }) => theme.colors.textPink};
  }
`;

export const AssetPermissionSelector = ({
  selectedAssets,
  onChange,
}: IAssetPermissionSelectorProps) => {
  const { ownedAssets, managedAssets, assetsLoading, fetchAsset } = useContext(AssetContext);
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assetIdInput, setAssetIdInput] = useState('');
  const [assetIdError, setAssetIdError] = useState('');
  const [validating, setValidating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allAssets = [...ownedAssets, ...managedAssets].filter(
    (asset, index, self) =>
      index === self.findIndex((a) => a.id === asset.id)
  );

  const filteredAssets = allAssets.filter((asset) => {
    const query = searchQuery.toLowerCase();
    return (
      formatUuid(asset.id).toLowerCase().includes(query) ||
      asset.name.toLowerCase().includes(query) ||
      asset.ticker?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setExpanded(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (assetId: string) => {
    if (selectedAssets.includes(assetId)) {
      onChange(selectedAssets.filter((id) => id !== assetId));
    } else {
      onChange([...selectedAssets, assetId]);
    }
  };

  const validateAssetId = async (value: string): Promise<{ error: string; assetId?: string }> => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      return { error: '' };
    }

    // Check for hex format: 0x followed by 32 hex characters
    const isHexFormat = /^0x[0-9a-fA-F]{32}$/.test(trimmedValue);
    
    // Check for UUID format: standard UUID pattern
    const isUuidFormat = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(trimmedValue);

    // If it's a valid asset ID format, return it as is
    if (isHexFormat || isUuidFormat) {
      return { error: '', assetId: trimmedValue };
    }

    // Check if it could be a ticker (12 characters or less, alphanumeric with allowed symbols)
    const isTickerFormat = trimmedValue.length <= 12 && /^[A-Z0-9_\-./]+$/i.test(trimmedValue);
    
    if (isTickerFormat) {
      // Try to fetch asset by ticker
      try {
        const asset = await fetchAsset(trimmedValue);
        if (asset) {
          return { error: '', assetId: asset.id };
        }
        return { error: 'Ticker not found' };
      } catch (error) {
        return { error: 'Ticker not found or invalid' };
      }
    }

    return { error: 'Invalid Asset ID or Ticker format' };
  };

  const handleAssetIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAssetIdInput(value);
    // Clear error on change
    setAssetIdError('');
  };

  const handleAddAssetId = async () => {
    const trimmedValue = assetIdInput.trim();
    
    if (!trimmedValue) {
      return;
    }

    setValidating(true);
    setAssetIdError('');

    const { error, assetId } = await validateAssetId(trimmedValue);
    
    setValidating(false);

    if (error) {
      setAssetIdError(error);
      return;
    }

    if (!assetId) {
      setAssetIdError('Failed to resolve asset');
      return;
    }

    if (selectedAssets.includes(assetId)) {
      setAssetIdError('Asset already added');
      return;
    }

    onChange([...selectedAssets, assetId]);
    setAssetIdInput('');
    setAssetIdError('');
  };

  const handleAssetIdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAssetId();
    }
  };

  return (
    <>
      <SelectWrapper ref={ref}>
        <StyledSelect
          type="button"
          $expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {selectedAssets.length > 0 ? (
            <SelectedCount>
              {selectedAssets.length} asset{selectedAssets.length === 1 ? '' : 's'} selected
            </SelectedCount>
          ) : (
            <StyledPlaceholder>Select assets...</StyledPlaceholder>
          )}
          <Icon name="ExpandIcon" className="expand-icon" size="18px" />
        </StyledSelect>

        {expanded && (
          <StyledExpandedSelect>
            <StyledInput
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {assetsLoading ? (
              <StyledOption $selected={false}>Loading assets...</StyledOption>
            ) : filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <StyledOption
                  key={asset.id}
                  $selected={selectedAssets.includes(asset.id)}
                  onClick={() => handleToggle(asset.id)}
                >
                  <IconWrapper $background={stringToColor(asset.id)}>
                    <Icon name="Coins" size="16px" />
                  </IconWrapper>
                  <div style={{ flex: 1 }}>
                    {formatUuid(asset.id)} - {asset.name}
                    {asset.ticker && ` (${asset.ticker})`}
                  </div>
                  {selectedAssets.includes(asset.id) && (
                    <Icon name="Check" size="16px" />
                  )}
                </StyledOption>
              ))
            ) : (
              <StyledOption $selected={false}>
                {searchQuery ? 'No assets found' : 'No assets available'}
              </StyledOption>
            )}
          </StyledExpandedSelect>
        )}
      </SelectWrapper>

      <AssetIdSection>
        <AssetIdLabel>Or enter an Asset ID or Ticker below:</AssetIdLabel>
        <AssetIdInputWrapper>
          <AssetIdInput
            type="text"
            placeholder="Enter Asset ID (0x... / UUID) or Ticker"
            value={assetIdInput}
            onChange={handleAssetIdChange}
            onKeyDown={handleAssetIdKeyDown}
            $hasError={!!assetIdError}
            disabled={validating}
          />
          <AddButton
            type="button"
            onClick={handleAddAssetId}
            disabled={!assetIdInput.trim() || validating}
          >
            {validating ? 'Validating...' : 'Add'}
          </AddButton>
        </AssetIdInputWrapper>
        {assetIdError && <ErrorMessage>{assetIdError}</ErrorMessage>}
      </AssetIdSection>

      {selectedAssets.length > 0 && (
        <SelectedAssetsList>
          {selectedAssets.map((assetId) => {
            const asset = allAssets.find(a => a.id === assetId);
            const displayText = asset 
              ? `${formatUuid(asset.id)}${asset.ticker ? ` (${asset.ticker})` : ''}`
              : formatUuid(assetId);
            
            return (
              <SelectedAssetItem key={assetId}>
                {displayText}
                <RemoveButton
                  type="button"
                  onClick={() => handleToggle(assetId)}
                  aria-label="Remove asset"
                >
                  <Icon name="CloseIcon" size="12px" />
                </RemoveButton>
              </SelectedAssetItem>
            );
          })}
        </SelectedAssetsList>
      )}
    </>
  );
};
