import { useState, useEffect, useRef, useMemo } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  AssetDetails,
  FungibleAsset,
  PortfolioBalance,
} from '@polymeshassociation/polymesh-sdk/types';
import { formatBalance, formatUuid, stringToColor } from '~/helpers/formatters';
import { Icon } from '~/components';
import { Text } from '~/components/UiKit';
import { useOutsideClick } from '../../hooks';
import { TSelectedAsset } from '../../constants';
import { validateAssetInputField } from './helpers';
import {
  SelectWrapper,
  StyledSelect,
  StyledExpandedSelect,
  SelectedOption,
  StyledSelectOption,
  StyledPlaceholder,
  StyledError,
  StyledInput,
} from '../../styles';
import {
  StyledAmountInput,
  InputWrapper,
  AssetWrapper,
  IconWrapper,
  StyledAvailableBalance,
  UseMaxButton,
} from './styles';

interface IAssetSelectProps {
  index: string;
  handleSelectAsset: (index: string, item?: Partial<TSelectedAsset>) => void;
  assets: PortfolioBalance[];
  assetBalance: number;
  portfolioName: string;
  disabled?: boolean;
}

export const AssetSelect: React.FC<IAssetSelectProps> = ({
  index,
  assets,
  assetBalance,
  portfolioName,
  handleSelectAsset,
  disabled,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<FungibleAsset | null>(
    null,
  );
  const [selectedAmount, setSelectedAmount] = useState('');
  const [validationError, setValidationError] = useState('');
  const [assetSelectExpanded, setAssetSelectExpanded] = useState(false);
  const [selectedAssetIsDivisible, setSelectedAssetIsDivisible] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAssets, setFilteredAssets] =
    useState<PortfolioBalance[]>(assets);
  const portfolioRef = useRef<string | undefined>(undefined);

  const assetDetailsCache = useRef<Record<string, AssetDetails>>({});

  const ref = useOutsideClick(() => {
    setAssetSelectExpanded(false);
    setSearchQuery('');
  });
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      const assetDetailsPromises = assets.map(async ({ asset }) => {
        if (!assetDetailsCache.current[asset.id]) {
          const details = await asset.details();
          assetDetailsCache.current[asset.id] = details;
        }
      });

      await Promise.all(assetDetailsPromises);
    };

    fetchAssetDetails();
  }, [assets]);

  const validateInput = (inputValue: string) => {
    const amount = Number(inputValue);

    const error = validateAssetInputField(
      inputValue,
      assetBalance,
      selectedAssetIsDivisible,
    );
    setValidationError(error);
    handleSelectAsset(index, {
      asset: selectedAsset?.id,
      amount: new BigNumber(error ? 0 : amount),
    });
  };

  const toggleAssetSelectDropdown = () => {
    if (disabled) return;
    setAssetSelectExpanded((prev) => {
      if (prev) setSearchQuery('');
      return !prev;
    });
  };

  const handleAssetSelect = (asset: FungibleAsset) => {
    setSelectedAsset(asset);
    setSelectedAmount('');
    const assetDetails = assetDetailsCache.current[asset.id];
    setSelectedAssetIsDivisible(assetDetails?.isDivisible ?? false);
    handleSelectAsset(index, {
      asset: asset.id,
      amount: new BigNumber(0),
    });
    setAssetSelectExpanded(false);
    setSearchQuery('');
  };

  const handleAmountChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    setSelectedAmount(target.value);
    validateInput(target.value);
  };

  const handleSearchChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    setSearchQuery(target.value);
  };

  const handleUseMax = () => {
    setSelectedAmount(assetBalance.toString());
    validateInput(assetBalance.toString());
  };

  const getAvailableBalance = () =>
    Number(selectedAmount) > assetBalance
      ? assetBalance
      : assetBalance - Number(selectedAmount);

  useEffect(() => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    setFilteredAssets(
      assets.filter(({ asset }) => {
        const assetDetails = assetDetailsCache.current[asset.id];
        return (
          formatUuid(asset.id).toLowerCase().includes(lowerSearchQuery) ||
          assetDetails?.name.toLowerCase().includes(lowerSearchQuery) ||
          assetDetails?.ticker?.toLowerCase().includes(lowerSearchQuery)
        );
      }),
    );
  }, [searchQuery, assets]);

  const selectedAssetDetails = useMemo(() => {
    if (!selectedAsset) return undefined;
    return assetDetailsCache.current[selectedAsset.id];
  }, [selectedAsset]);

  useEffect(() => {
    if (portfolioRef.current !== portfolioName) {
      if (selectedAmount) {
        // reset amount if portfolio changed (advanced transfer)
        handleSelectAsset(index);
      }
      setSelectedAsset(null);
      setSelectedAmount('');
    }
    portfolioRef.current = portfolioName;
  }, [handleSelectAsset, index, portfolioName, selectedAmount]);

  useEffect(() => {
    if (assetSelectExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [assetSelectExpanded]);

  return (
    <AssetWrapper>
      <div>
        <Text size="medium" bold marginBottom={3}>
          Asset
        </Text>
        <SelectWrapper ref={ref}>
          <StyledSelect
            onClick={toggleAssetSelectDropdown}
            $disabled={disabled}
            $expanded={assetSelectExpanded}
          >
            {selectedAsset ? (
              <SelectedOption>
                <IconWrapper $background={stringToColor(selectedAsset.id)}>
                  <Icon name="Coins" size="16px" />
                </IconWrapper>
                {selectedAssetDetails
                  ? `${formatUuid(selectedAsset.id)} - ${selectedAssetDetails.name} ${
                      selectedAssetDetails.ticker &&
                      `(${selectedAssetDetails.ticker})`
                    }`
                  : formatUuid(selectedAsset.id)}
              </SelectedOption>
            ) : (
              <StyledPlaceholder>Select Asset</StyledPlaceholder>
            )}
            <Icon name="ExpandIcon" className="expand-icon" size="18px" />
          </StyledSelect>
          {assetSelectExpanded && (
            <StyledExpandedSelect>
              <StyledInput
                ref={searchInputRef}
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {filteredAssets.length > 0 ? (
                filteredAssets.map(({ asset }) => {
                  const assetDetails = assetDetailsCache.current[asset.id];
                  return (
                    <StyledSelectOption
                      key={asset.toHuman()}
                      onClick={() => handleAssetSelect(asset)}
                    >
                      <IconWrapper $background={stringToColor(asset.id)}>
                        <Icon name="Coins" size="16px" />
                      </IconWrapper>
                      {assetDetails
                        ? `${formatUuid(asset.id)} - ${assetDetails.name} ${
                            assetDetails.ticker && `(${assetDetails.ticker})`
                          }`
                        : formatUuid(asset.id)}
                    </StyledSelectOption>
                  );
                })
              ) : (
                <StyledPlaceholder>No assets found</StyledPlaceholder>
              )}
            </StyledExpandedSelect>
          )}
        </SelectWrapper>
      </div>
      <div>
        <Text size="medium" bold marginBottom={3}>
          Amount
        </Text>
        <InputWrapper>
          <StyledAmountInput
            name="amount"
            placeholder="Enter Amount"
            value={selectedAmount}
            onChange={handleAmountChange}
            disabled={!selectedAsset}
          />
          {!!assetBalance && (
            <UseMaxButton onClick={handleUseMax}>Use max</UseMaxButton>
          )}
        </InputWrapper>
        {!!validationError && <StyledError>{validationError}</StyledError>}
        {!!selectedAsset && (
          <StyledAvailableBalance>
            <Text>Available balance:</Text>
            <Text>{formatBalance(getAvailableBalance())}</Text>
          </StyledAvailableBalance>
        )}
      </div>
    </AssetWrapper>
  );
};
