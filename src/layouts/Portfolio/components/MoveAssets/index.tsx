import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  DefaultPortfolio,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { useState } from 'react';
import { Icon, Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { usePortfolio } from '~/hooks/polymesh';
import { AssetSelect } from './components/AssetSelect';
import { PortfolioSelect } from './components/PortfolioSelect';
import { StyledAddButton, StyledButtonsWrapper } from './styles';

interface IMoveAssetsProps {
  portfolio: IPortfolioData;
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}

export interface IAssetItem {
  asset: string;
  amount: BigNumber;
}

export const MoveAssets: React.FC<IMoveAssetsProps> = ({
  portfolio,
  toggleModal,
}) => {
  const [assetIndexes, setAssetIndexes] = useState<number[]>([0]);
  const [assetItems, setAssetItems] = useState<IAssetItem[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<
    DefaultPortfolio | NumberedPortfolio | null
  >(null);
  const { moveAssets } = usePortfolio(portfolio.portfolio);

  const handleAddAssetField = () => {
    setAssetIndexes((prev) => [...prev, prev[prev.length - 1] + 1]);
  };
  const handleAddAssetItem = (item: IAssetItem) => {
    if (
      assetItems.find(
        ({ asset, amount }) => asset === item.asset && amount === item.amount,
      )
    )
      return;

    const newItems = assetItems.find(({ asset }) => asset === item.asset)
      ? assetItems.map((assetItem) => {
          if (assetItem.asset === item.asset) {
            return { ...assetItem, amount: item.amount };
          }
          return assetItem;
        })
      : [...assetItems, item];
    setAssetItems(newItems);
  };
  const handleDeleteAsset = (index: number, asset?: string) => {
    setAssetIndexes((prev) => prev.filter((prevIndex) => prevIndex !== index));
    if (asset) {
      setAssetItems((prev) => prev.filter((item) => item.asset !== asset));
    }
  };

  const handleSelectPortfolio = (
    option: DefaultPortfolio | NumberedPortfolio,
  ) => {
    setSelectedPortfolio(option);
  };

  const handleMoveAssets = () => {
    moveAssets({
      to: selectedPortfolio as DefaultPortfolio | NumberedPortfolio,
      items: assetItems,
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
          handleAdd={handleAddAssetItem}
          handleDelete={handleDeleteAsset}
          selectedAssets={assetItems.map(({ asset }) => asset)}
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
            !assetItems.length ||
            assetItems.some(({ amount }) => amount.toNumber() <= 0) ||
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
