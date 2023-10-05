import { useState, useRef, useEffect } from 'react';
import { FungibleAsset } from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { Icon } from '~/components';
import { Text } from '~/components/UiKit';
import {
  StyledAmountInput,
  InputWrapper,
  StyledAssetSelect,
  StyledPlaceholder,
  StyledWrapper,
  AssetWrapper,
  AssetSelectWrapper,
  StyledExpandedSelect,
  StyledSelectOption,
  IconWrapper,
  SelectedOption,
  StyledAvailableBalance,
  StyledError,
  CloseButton,
  UseMaxButton,
  StyledMemoLabel,
  StyledInput,
} from './styles';
import { formatBalance, stringToColor } from '~/helpers/formatters';
import { ISelectedAsset } from '../../types';

interface IAssetSelectProps {
  portfolio: IPortfolioData;
  index: number;
  handleAdd: (item: ISelectedAsset) => void;
  handleDelete: (index: number) => void;
  selectedAssets: ISelectedAsset[];
}

export const AssetSelect: React.FC<IAssetSelectProps> = ({
  portfolio,
  index,
  handleAdd,
  handleDelete,
  selectedAssets,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<FungibleAsset | null>(
    null,
  );
  const [availableBalance, setAvailableBalance] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState('');
  const [validationError, setValidationError] = useState('');
  const [memo, setMemo] = useState('');
  const [memoExpanded, setMemoExpanded] = useState(false);
  const [assetSelectExpanded, setAssetSelectExpanded] = useState(false);
  const [selectedAssetIsDivisible, setSelectedAssetIsDivisible] =
    useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedAsset) return;

    const getAssetDetails = async () => {
      const assetDetails = await selectedAsset.details();
      setSelectedAssetIsDivisible(assetDetails.isDivisible);
    };

    getAssetDetails();
  }, [selectedAsset]);

  useEffect(() => {
    const handleClickOutside: EventListenerOrEventListenerObject = (event) => {
      if (ref.current && !ref.current.contains(event.target as Node | null)) {
        setAssetSelectExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  const validateInput = (inputValue: string, optionalMemo?: string) => {
    const amount = Number(inputValue);
    let error = '';

    if (Number.isNaN(amount)) {
      error = 'Amount must be a number';
    } else if (!inputValue) {
      error = 'Amount is required';
    } else if (amount <= 0) {
      error = 'Amount must be greater than zero';
    } else if (amount > availableBalance) {
      error = 'Insufficient balance';
    } else if (!selectedAssetIsDivisible && inputValue.indexOf('.') !== -1) {
      error = 'Asset does not allow decimal places';
    } else if (
      inputValue.indexOf('.') !== -1 &&
      inputValue.substring(inputValue.indexOf('.') + 1).length > 6
    ) {
      error = 'Amount must have at most 6 decimal places';
    }

    setValidationError(error);

    handleAdd({
      asset: (selectedAsset as FungibleAsset).toHuman(),
      amount: error ? 0 : amount,
      index,
      memo: optionalMemo || memo,
    });
  };

  const toggleAssetSelectDropdown = () =>
    setAssetSelectExpanded((prev) => !prev);

  const handleAssetSelect = (asset: FungibleAsset, balance: BigNumber) => {
    setSelectedAsset(asset);
    setAvailableBalance(balance.toNumber());
    setSelectedAmount('');
    setMemo('');
    handleAdd({ asset: asset.toHuman(), amount: 0, index });
    toggleAssetSelectDropdown();
  };

  const handleAmountChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    setSelectedAmount(target.value);
    validateInput(target.value);
  };

  const handleUseMax = () => {
    setSelectedAmount(availableBalance.toString());
    validateInput(availableBalance.toString());
  };

  const handleMemoChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    setMemo(target.value);
    validateInput(selectedAmount, target.value);
  };

  const filteredAssets = portfolio.assets.filter(
    ({ asset }) =>
      !selectedAssets.some((selected) => selected.asset === asset.toHuman()),
  );

  return (
    <StyledWrapper>
      {!!index && (
        <CloseButton onClick={() => handleDelete(index)}>
          <Icon name="CloseIcon" size="16px" />
        </CloseButton>
      )}
      <AssetWrapper>
        <div>
          <Text size="medium" bold marginBottom={3}>
            Asset
          </Text>
          <AssetSelectWrapper ref={ref}>
            <StyledAssetSelect
              onClick={toggleAssetSelectDropdown}
              $expanded={assetSelectExpanded}
            >
              {portfolio.assets.length && selectedAsset ? (
                <SelectedOption>
                  <IconWrapper
                    $background={stringToColor(selectedAsset.toHuman())}
                  >
                    <Icon name="Coins" size="16px" />
                  </IconWrapper>
                  {selectedAsset.toHuman()}
                </SelectedOption>
              ) : (
                <StyledPlaceholder>Select Asset</StyledPlaceholder>
              )}
              <Icon name="ExpandIcon" className="expand-icon" size="18px" />
            </StyledAssetSelect>
            {assetSelectExpanded && (
              <StyledExpandedSelect>
                {portfolio.assets.length && !!filteredAssets.length ? (
                  filteredAssets.map(({ asset, free }) => (
                    <StyledSelectOption
                      key={asset.toHuman()}
                      onClick={() => handleAssetSelect(asset, free)}
                    >
                      <IconWrapper $background={stringToColor(asset.toHuman())}>
                        <Icon name="Coins" size="16px" />
                      </IconWrapper>{' '}
                      {asset.toHuman()}
                    </StyledSelectOption>
                  ))
                ) : (
                  <StyledPlaceholder>No assets available</StyledPlaceholder>
                )}
              </StyledExpandedSelect>
            )}
          </AssetSelectWrapper>
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
              disabled={!selectedAsset || !availableBalance}
            />
            {!!availableBalance && (
              <UseMaxButton onClick={handleUseMax}>Use max</UseMaxButton>
            )}
          </InputWrapper>
        </div>
      </AssetWrapper>
      {!!validationError && <StyledError>{validationError}</StyledError>}
      {!!portfolio.assets.length && !!selectedAsset && (
        <StyledAvailableBalance>
          <Text>Available balance:</Text>
          <Text>{formatBalance(availableBalance)}</Text>
        </StyledAvailableBalance>
      )}
      <StyledMemoLabel
        onClick={() => setMemoExpanded((prev) => !prev)}
        $expanded={memoExpanded}
      >
        <Text size="medium" bold>
          Memo (Optional - this will be public)
        </Text>
        <Icon name="ExpandIcon" className="icon" size="18px" />
      </StyledMemoLabel>
      {memoExpanded && (
        <StyledInput
          type="text"
          value={memo}
          onChange={handleMemoChange}
          placeholder="Enter movement memo"
          maxLength={32}
        />
      )}
    </StyledWrapper>
  );
};
