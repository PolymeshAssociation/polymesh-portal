import {
  DefaultPortfolio,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { useState } from 'react';
import { AssetForm, MemoField, Icon, Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { usePortfolio } from '~/hooks/polymesh';
import { useWindowWidth } from '~/hooks/utility';
import { PortfolioSelect } from './components/PortfolioSelect';
import { StyledAddButton, StyledButtonsWrapper } from './styles';
import { IMoveAssetsProps } from './types';
import { useAssetForm } from '~/components/AssetForm/hooks';

export const MoveAssets: React.FC<IMoveAssetsProps> = ({
  portfolio,
  toggleModal,
}) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<
    DefaultPortfolio | NumberedPortfolio | null
  >(null);
  const { moveAssets } = usePortfolio(portfolio.portfolio);
  const { isMobile } = useWindowWidth();

  const {
    assets,
    collections,
    selectedAssets,
    portfolioName,
    nfts,
    getNftsPerCollection,
    getAssetBalance,
    handleAddAsset,
    handleDeleteAsset,
    handleSelectAsset,
  } = useAssetForm(portfolio);

  const handleSelectPortfolio = (
    option: DefaultPortfolio | NumberedPortfolio,
  ) => {
    setSelectedPortfolio(option);
  };

  const handleMoveAsset = () => {
    if (!selectedPortfolio || !Object.values(selectedAssets).length) return;
    const items = Object.values(selectedAssets);

    moveAssets({
      to: selectedPortfolio,
      items,
    });
    toggleModal();
  };

  const filteredAssets = assets.filter(
    ({ asset }) =>
      !Object.values(selectedAssets).some(
        (selected) => selected.asset === asset.toHuman(),
      ),
  );

  const filteredCollections = collections.filter(
    (collection) =>
      !Object.values(selectedAssets).some(
        (selected) => selected.asset === collection.id,
      ),
  );

  return (
    <Modal handleClose={toggleModal}>
      <Heading type="h4" marginBottom={32}>
        Move Assets between {isMobile && <br />} Portfolios
      </Heading>
      <PortfolioSelect
        portfolio={portfolio}
        handleSelect={handleSelectPortfolio}
        selectedPortfolio={selectedPortfolio}
      />
      {Object.keys(selectedAssets).map((asset) => (
        <AssetForm
          key={asset}
          index={asset}
          collections={filteredCollections}
          assets={filteredAssets}
          portfolioName={portfolioName}
          nfts={nfts}
          getNftsPerCollection={getNftsPerCollection}
          handleSelectAsset={handleSelectAsset}
          handleDeleteAsset={handleDeleteAsset}
          assetBalance={getAssetBalance(selectedAssets[asset].asset)}
          memo={
            <MemoField handleSelectAsset={handleSelectAsset} index={asset} />
          }
          indexArray={Object.keys(selectedAssets)}
        />
      ))}

      <StyledAddButton
        onClick={handleAddAsset}
        disabled={
          Object.keys(selectedAssets).length >=
          collections.length + assets.length
        }
      >
        <Icon name="Plus" />
        Add Asset
      </StyledAddButton>
      <StyledButtonsWrapper>
        {!isMobile && (
          <Button variant="modalSecondary" onClick={toggleModal}>
            Cancel
          </Button>
        )}
        <Button
          variant="modalPrimary"
          disabled={
            !Object.keys(selectedAssets).length ||
            !selectedPortfolio ||
            Object.values(selectedAssets).some((asset) => {
              if ('amount' in asset) {
                return asset.amount.toNumber() <= 0;
              }
              return !asset.nfts?.length;
            })
          }
          onClick={handleMoveAsset}
        >
          Apply
        </Button>
      </StyledButtonsWrapper>
    </Modal>
  );
};
