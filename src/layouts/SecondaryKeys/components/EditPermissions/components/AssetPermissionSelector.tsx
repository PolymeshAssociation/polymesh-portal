import { useContext, useEffect, useRef, useState } from 'react';
import { Icon } from '~/components';
import { AssetContext } from '~/context/AssetContext';
import { formatUuid, stringToColor } from '~/helpers/formatters';
import type { AssetDetails } from '../../../utils';
import { deduplicateAssetsByID, formatAssetDisplay } from '../../../utils';
import {
  AssetAddButton,
  AssetClearAllButton,
  AssetDetailsWrap,
  AssetErrorMessage,
  AssetId,
  AssetIdInput,
  AssetIdInputWrapper,
  AssetInfo,
  AssetNameTicker,
  AssetRemoveButton,
  AssetSelectedIndicator,
  CountText,
  DropdownButton,
  DropdownMenu,
  DropdownOption,
  IconWrapper,
  InputLabel,
  ItemCount,
  Placeholder,
  SearchInput,
  SelectedAssetItem,
  SelectedAssetsContainer,
  SelectedAssetsHeader,
  SelectedAssetsList,
  SelectWrapper,
} from '../styles';

interface IAssetPermissionSelectorProps {
  selectedAssets: string[];
  onChange: (assets: string[]) => void;
  resolvedAssets: AssetDetails[];
  onResolveAsset: (asset: AssetDetails) => void;
}

export const AssetPermissionSelector = ({
  selectedAssets,
  onChange,
  resolvedAssets,
  onResolveAsset,
}: IAssetPermissionSelectorProps) => {
  const {
    ownedAssets,
    managedAssets,
    assetsLoading,
    fetchAsset,
    fetchAssetDetails,
  } = useContext(AssetContext);
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assetIdInput, setAssetIdInput] = useState('');
  const [assetIdError, setAssetIdError] = useState('');
  const [validating, setValidating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allAssets = deduplicateAssetsByID(
    ownedAssets,
    managedAssets,
    resolvedAssets,
  );

  const filteredAssets = allAssets.filter((asset) => {
    const query = searchQuery.toLowerCase();
    return (
      formatUuid(asset.id).toLowerCase().includes(query) ||
      asset.name?.toLowerCase().includes(query) ||
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

  const validateAssetId = async (
    value: string,
  ): Promise<{ error: string; assetId?: string }> => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return { error: '' };
    }

    // Check for hex format: 0x followed by 32 hex characters
    const isHexFormat = /^0x[0-9a-fA-F]{32}$/.test(trimmedValue);

    // Check for UUID format: standard UUID pattern
    const isUuidFormat =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(
        trimmedValue,
      );

    // If it's a valid asset ID format, return it as is
    if (isHexFormat || isUuidFormat) {
      return { error: '', assetId: trimmedValue };
    }

    // Check if it could be a ticker (12 characters or less, uppercase alphanumeric - Polymesh ticker format)
    const uppercasedValue = trimmedValue.toUpperCase();
    const isTickerFormat =
      uppercasedValue.length <= 12 && /^[A-Z0-9]+$/.test(uppercasedValue);

    if (isTickerFormat) {
      // Try to fetch asset by ticker
      try {
        const asset = await fetchAsset(uppercasedValue);
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
    const { value } = e.target;
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

    let resolvedAsset: AssetDetails | undefined;
    const resolvedDetails = await fetchAssetDetails(assetId);
    if (resolvedDetails?.details) {
      resolvedAsset = {
        id: resolvedDetails.assetId,
        name: resolvedDetails.details.name,
        ticker: resolvedDetails.details.ticker || undefined,
      };
    } else {
      const fallbackAsset = await fetchAsset(assetId);
      if (fallbackAsset) {
        try {
          const details = await fallbackAsset.details();
          resolvedAsset = {
            id: fallbackAsset.id,
            name: details.name || undefined,
            ticker: details.ticker || undefined,
          };
        } catch (detailError) {
          resolvedAsset = undefined;
        }
      }
    }

    if (resolvedAsset) {
      onResolveAsset(resolvedAsset);
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

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <>
      <SelectWrapper ref={ref}>
        <DropdownButton
          type="button"
          $expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {selectedAssets.length > 0 ? (
            <CountText>
              {selectedAssets.length} asset
              {selectedAssets.length === 1 ? '' : 's'} selected
            </CountText>
          ) : (
            <Placeholder>Select assets...</Placeholder>
          )}
          <Icon name="ExpandIcon" className="expand-icon" size="18px" />
        </DropdownButton>

        {expanded && (
          <DropdownMenu>
            <SearchInput
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {assetsLoading && (
              <DropdownOption $selected={false}>
                Loading assets...
              </DropdownOption>
            )}
            {!assetsLoading && filteredAssets.length > 0 && (
              <>
                {filteredAssets.map((asset) => (
                  <DropdownOption
                    key={asset.id}
                    $selected={selectedAssets.includes(asset.id)}
                    onClick={() => handleToggle(asset.id)}
                  >
                    <IconWrapper $background={stringToColor(asset.id)}>
                      <Icon name="Coins" size="14px" />
                    </IconWrapper>
                    <div
                      style={{
                        flex: 1,
                        fontSize: '14px',
                      }}
                    >
                      {formatAssetDisplay(asset.id, allAssets)}
                    </div>
                    {selectedAssets.includes(asset.id) && (
                      <AssetSelectedIndicator>
                        <Icon name="Coins" size="20px" />
                      </AssetSelectedIndicator>
                    )}
                  </DropdownOption>
                ))}
              </>
            )}
            {!assetsLoading && filteredAssets.length === 0 && (
              <DropdownOption $selected={false}>
                {searchQuery ? 'No assets found' : 'No assets available'}
              </DropdownOption>
            )}
          </DropdownMenu>
        )}
      </SelectWrapper>

      <div>
        <InputLabel>Or enter an Asset ID or Ticker below:</InputLabel>
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
          <AssetAddButton
            type="button"
            onClick={handleAddAssetId}
            disabled={!assetIdInput.trim() || validating}
          >
            {validating ? 'Validating...' : 'Add'}
          </AssetAddButton>
        </AssetIdInputWrapper>
        {assetIdError && <AssetErrorMessage>{assetIdError}</AssetErrorMessage>}
      </div>

      {selectedAssets.length > 0 && (
        <SelectedAssetsContainer>
          <SelectedAssetsHeader>
            <ItemCount>
              {selectedAssets.length} asset
              {selectedAssets.length === 1 ? '' : 's'} selected
            </ItemCount>
            <AssetClearAllButton
              type="button"
              onClick={handleClearAll}
              disabled={selectedAssets.length === 0}
              aria-label="Clear all selected assets"
            >
              Clear All
              <Icon name="Delete" size="14px" />
            </AssetClearAllButton>
          </SelectedAssetsHeader>
          <SelectedAssetsList>
            {selectedAssets.map((assetId) => {
              const asset = allAssets.find((a) => a.id === assetId);
              const assetName = asset?.name;
              const assetTicker = asset?.ticker;

              return (
                <SelectedAssetItem key={assetId}>
                  <AssetInfo>
                    <IconWrapper $background={stringToColor(assetId)}>
                      <Icon name="Coins" size="12px" />
                    </IconWrapper>
                    <AssetDetailsWrap>
                      <AssetId>{formatUuid(assetId)}</AssetId>
                      {(assetName || assetTicker) && (
                        <AssetNameTicker>
                          {assetName && `${assetName}`}
                          {assetTicker && ` (${assetTicker})`}
                        </AssetNameTicker>
                      )}
                    </AssetDetailsWrap>
                  </AssetInfo>
                  <AssetRemoveButton
                    type="button"
                    onClick={() => handleToggle(assetId)}
                    aria-label="Remove asset"
                  >
                    <Icon name="CloseIcon" size="12px" />
                  </AssetRemoveButton>
                </SelectedAssetItem>
              );
            })}
          </SelectedAssetsList>
        </SelectedAssetsContainer>
      )}
    </>
  );
};
