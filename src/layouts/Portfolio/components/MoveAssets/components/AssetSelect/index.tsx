import { useState, useRef, useEffect } from 'react';
import { Asset } from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { Icon } from '~/components';
import { Text } from '~/components/UiKit';
import {
  StyledAmountInput,
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
} from './styles';
import { formatBalance, stringToColor } from '~/helpers/formatters';

interface IAssetItem {
  asset: string;
  amount: BigNumber;
}

interface IAssetSelectProps {
  portfolio: IPortfolioData;
  index: number;
  handleAdd: (item: IAssetItem) => void;
  handleDelete: (index: number, asset?: string) => void;
  selectedAssets: string[];
}

export const AssetSelect: React.FC<IAssetSelectProps> = ({
  portfolio,
  index,
  handleAdd,
  handleDelete,
  selectedAssets,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState('');
  const [validationError, setValidationError] = useState('');
  const [assetItem, setAssetItem] = useState<IAssetItem | null>(null);
  const [assetSelectExpanded, setAssetSelectExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!assetItem) return;

    handleAdd(assetItem);
  }, [assetItem, handleAdd, selectedAmount]);

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

  const filteredAssets = portfolio.assets.filter(
    ({ asset }) => !selectedAssets.includes(asset.toHuman()),
  );

  const validateInput = (inputValue: string) => {
    setAssetItem(null);

    if (Number.isNaN(Number(inputValue))) {
      setValidationError('Amount must be a number');
      if (assetItem) {
        setAssetItem({
          asset: (selectedAsset as Asset).toHuman(),
          amount: new BigNumber(0),
        });
      }
      return;
    }
    if (!inputValue) {
      setValidationError('Amount is required');
      if (assetItem) {
        setAssetItem({
          asset: (selectedAsset as Asset).toHuman(),
          amount: new BigNumber(0),
        });
      }
      return;
    }
    if (Number(inputValue) <= 0) {
      setValidationError('Amount must be greater than zero');
      if (assetItem) {
        setAssetItem({
          asset: (selectedAsset as Asset).toHuman(),
          amount: new BigNumber(0),
        });
      }
      return;
    }
    if (Number(inputValue) >= availableBalance) {
      setValidationError('Insufficient balance');
      if (assetItem) {
        setAssetItem({
          asset: (selectedAsset as Asset).toHuman(),
          amount: new BigNumber(0),
        });
      }
      return;
    }

    setValidationError('');

    if (!assetItem || assetItem.amount.toString() !== inputValue) {
      setAssetItem({
        asset: (selectedAsset as Asset).toHuman(),
        amount: new BigNumber(Number(inputValue)),
      });
    }
  };

  const toggleAssetSelectDropdown = () =>
    setAssetSelectExpanded((prev) => !prev);

  const handleAssetSelect = (asset: Asset, balance: BigNumber) => {
    if (selectedAssets.includes(asset.toHuman())) return;

    setSelectedAsset(asset);
    setAvailableBalance(balance.toNumber());
    toggleAssetSelectDropdown();
  };

  const handleAmountChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    setSelectedAmount(target.value);
    validateInput(target.value);
  };
  return (
    <StyledWrapper>
      {!!index && (
        <CloseButton
          onClick={() => handleDelete(index, selectedAsset?.toHuman())}
        >
          <Icon name="CloseIcon" />
        </CloseButton>
      )}
      <AssetWrapper>
        <div>
          <Text size="medium" bold marginBottom={3}>
            Asset
          </Text>
          <AssetSelectWrapper ref={ref}>
            <StyledAssetSelect onClick={toggleAssetSelectDropdown}>
              {portfolio.assets.length && selectedAsset ? (
                <SelectedOption>
                  <IconWrapper
                    background={stringToColor(selectedAsset.toHuman())}
                  >
                    <Icon name="Coins" size="16px" />
                  </IconWrapper>
                  {selectedAsset.toHuman()}
                </SelectedOption>
              ) : (
                <StyledPlaceholder>Select Asset</StyledPlaceholder>
              )}
              <Icon name="ExpandIcon" className="expand-icon" />
            </StyledAssetSelect>
            {assetSelectExpanded && (
              <StyledExpandedSelect>
                {portfolio.assets.length ? (
                  filteredAssets.map(({ asset, free }) => (
                    <StyledSelectOption
                      key={asset.toHuman()}
                      onClick={() => handleAssetSelect(asset, free)}
                    >
                      <IconWrapper background={stringToColor(asset.toHuman())}>
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
          <StyledAmountInput
            name="amount"
            placeholder="Enter Amount"
            value={selectedAmount}
            onChange={handleAmountChange}
            disabled={!selectedAsset || !availableBalance}
          />
        </div>
      </AssetWrapper>
      {!!validationError && <StyledError>{validationError}</StyledError>}
      {!!portfolio.assets.length && !!availableBalance && (
        <StyledAvailableBalance>
          <Text>Available balance:</Text>
          <Text>{formatBalance(availableBalance)}</Text>
        </StyledAvailableBalance>
      )}
    </StyledWrapper>
  );
};
