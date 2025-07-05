import React, { useContext } from 'react';
import { Button, RefreshButton } from '~/components/UiKit';
import { StyledAssetNavBar, StyledAssetActions } from './styles';
import { AssetContext } from '~/context/AssetContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';

interface IAssetManagerNavigationProps {
  onCreateAsset: () => void;
}

const AssetManagerNavigation: React.FC<IAssetManagerNavigationProps> = ({
  onCreateAsset,
}) => {
  const { assetsLoading, refreshAssets } = useContext(AssetContext);
  const { isTransactionInProgress } = useTransactionStatusContext();
  return (
    <StyledAssetNavBar>
      <StyledAssetActions>
        <Button
          variant="modalPrimary"
          onClick={onCreateAsset}
          disabled={isTransactionInProgress}
        >
          Create New Asset
        </Button>
        <RefreshButton onClick={refreshAssets} disabled={assetsLoading} />
      </StyledAssetActions>
    </StyledAssetNavBar>
  );
};

export default AssetManagerNavigation;
