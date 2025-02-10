import React, { useContext } from 'react';
import { Button, RefreshButton } from '~/components/UiKit';
import { StyledAssetNavBar, StyledAssetActions } from './styles';
import { AssetContext } from '~/context/AssetContext';

interface IAssetManagerNavigationProps {
  onCreateAsset: () => void;
}

const AssetManagerNavigation: React.FC<IAssetManagerNavigationProps> = ({
  onCreateAsset,
}) => {
  const { assetsLoading, refreshAssets } = useContext(AssetContext);
  return (
    <StyledAssetNavBar>
      <StyledAssetActions>
        <Button variant="modalPrimary" onClick={onCreateAsset}>
          Create New Asset
        </Button>
        <RefreshButton onClick={refreshAssets} disabled={assetsLoading} />
      </StyledAssetActions>
    </StyledAssetNavBar>
  );
};

export default AssetManagerNavigation;
