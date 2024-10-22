import { useState, useEffect, useRef } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  FungibleAsset,
  PortfolioBalance,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  formatBalance,
  formatUuid,
  hexToUuid,
  stringToColor,
} from '~/helpers/formatters';
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
  const portfolioRef = useRef<string | undefined>(undefined);
  const ref = useOutsideClick(() => setAssetSelectExpanded(false));

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
    setAssetSelectExpanded((prev) => !prev);
  };

  const handleAssetSelect = (asset: FungibleAsset) => {
    setSelectedAsset(asset);
    setSelectedAmount('');
    handleSelectAsset(index, {
      asset: asset.toHuman(),
      amount: new BigNumber(0),
    });
    toggleAssetSelectDropdown();
  };

  const handleAmountChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    setSelectedAmount(target.value);
    validateInput(target.value);
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
    if (!selectedAsset) return;

    const getAssetDetails = async () => {
      const assetDetails = await selectedAsset.details();
      setSelectedAssetIsDivisible(assetDetails.isDivisible);
    };

    getAssetDetails();
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

  return (
    <>
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
              {assets && selectedAsset ? (
                <SelectedOption>
                  <IconWrapper $background={stringToColor(selectedAsset.id)}>
                    <Icon name="Coins" size="16px" />
                  </IconWrapper>
                  {formatUuid(hexToUuid(selectedAsset.id))}
                </SelectedOption>
              ) : (
                <StyledPlaceholder>Select Asset</StyledPlaceholder>
              )}
              <Icon name="ExpandIcon" className="expand-icon" size="18px" />
            </StyledSelect>
            {assetSelectExpanded && (
              <StyledExpandedSelect>
                {assets?.length ? (
                  assets.map(({ asset }) => (
                    <StyledSelectOption
                      key={asset.toHuman()}
                      onClick={() => handleAssetSelect(asset)}
                    >
                      <IconWrapper $background={stringToColor(asset.id)}>
                        <Icon name="Coins" size="16px" />
                      </IconWrapper>{' '}
                      {formatUuid(hexToUuid(asset.id))}
                    </StyledSelectOption>
                  ))
                ) : (
                  <StyledPlaceholder>No assets available</StyledPlaceholder>
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
        </div>
      </AssetWrapper>
      {!!validationError && <StyledError>{validationError}</StyledError>}
      {!!selectedAsset && (
        <StyledAvailableBalance>
          <Text>Available balance:</Text>
          <Text>{formatBalance(getAvailableBalance())}</Text>
        </StyledAvailableBalance>
      )}
    </>
  );
};
