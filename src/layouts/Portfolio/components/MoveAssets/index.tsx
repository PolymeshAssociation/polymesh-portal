import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  DefaultPortfolio,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { useState } from 'react';
import { Icon, Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { usePortfolio } from '~/hooks/polymesh';
import { AssetSelect } from './components/AssetSelect';
import { PortfolioSelect } from './components/PortfolioSelect';
import { StyledAddButton, StyledButtonsWrapper } from './styles';
import { IMoveAssetsProps, IAssetItem, ISelectedAsset } from './types';

const parseSelectedAssets = (assets: ISelectedAsset[]): IAssetItem[] => {
  return assets.map(({ asset, amount }) => ({
    asset,
    amount: new BigNumber(amount),
  }));
};

export const MoveAssets: React.FC<IMoveAssetsProps> = ({
  portfolio,
  toggleModal,
}) => {
  const [assetIndexes, setAssetIndexes] = useState<number[]>([0]);
  const [selectedAssets, setSelectedAssets] = useState<ISelectedAsset[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<
    DefaultPortfolio | NumberedPortfolio | null
  >(null);
  const { moveAssets } = usePortfolio(portfolio.portfolio);

  const handleAddAssetField = () => {
    setAssetIndexes((prev) => [...prev, prev[prev.length - 1] + 1]);
  };

  const addAssetItem = (item: ISelectedAsset) => {
    if (
      !selectedAssets.some(({ index }) => index === item.index) &&
      !selectedAssets.some(({ asset }) => asset === item.asset)
    ) {
      setSelectedAssets((prev) => [...prev, item]);
    } else {
      const updatedAssets = selectedAssets.reduce((acc, assetItem) => {
        if (assetItem.asset === item.asset && assetItem.index !== item.index) {
          return [...acc, { ...assetItem, amount: item.amount }];
        }

        if (assetItem.index === item.index) {
          const updatedAcc = acc.filter(({ index }) => index !== item.index);

          return [
            ...updatedAcc,
            { ...assetItem, asset: item.asset, amount: item.amount },
          ];
        }

        return [...acc, assetItem];
      }, [] as ISelectedAsset[]);

      setSelectedAssets(updatedAssets);
    }
  };

  const deleteAsset = (index: number) => {
    setAssetIndexes((prev) => prev.filter((prevIndex) => prevIndex !== index));

    const updatedAssets = selectedAssets.filter(
      (selectedAsset) => selectedAsset.index !== index,
    );
    setSelectedAssets(updatedAssets);
  };

  const handleSelectPortfolio = (
    option: DefaultPortfolio | NumberedPortfolio,
  ) => {
    setSelectedPortfolio(option);
  };

  const handleMoveAssets = () => {
    if (!selectedPortfolio) return;

    moveAssets({
      to: selectedPortfolio,
      items: parseSelectedAssets(selectedAssets),
    });
    toggleModal();
  };

  return (
    <Modal handleClose={toggleModal}>
      <Heading type="h4" marginBottom={32}>
        Move Assets between Portfolios
      </Heading>
      <PortfolioSelect
        portfolio={portfolio}
        handleSelect={handleSelectPortfolio}
        selectedPortfolio={selectedPortfolio}
      />
      {assetIndexes.map((index) => (
        <AssetSelect
          key={index}
          portfolio={portfolio}
          index={index}
          handleAdd={addAssetItem}
          handleDelete={deleteAsset}
          selectedAssets={selectedAssets}
        />
      ))}
      <StyledAddButton
        onClick={handleAddAssetField}
        disabled={assetIndexes.length >= portfolio.assets.length}
      >
        <Icon name="Plus" />
        Add Asset
      </StyledAddButton>
      <StyledButtonsWrapper>
        <Button variant="modalSecondary" onClick={toggleModal}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          disabled={
            !selectedAssets.length ||
            selectedAssets.some(({ amount }) => amount <= 0) ||
            !selectedPortfolio
          }
          onClick={handleMoveAssets}
        >
          Apply
        </Button>
      </StyledButtonsWrapper>
    </Modal>
  );
};
