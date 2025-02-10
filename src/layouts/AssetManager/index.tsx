import { useNavigate } from 'react-router-dom';
import AssetManagerNavigation from './components/AssetManagerNavigation';
import { StyledAssetManager } from './styles';
import { AssetManagerTable } from './components/AssetManagerTable';
import { PATHS } from '~/constants/routes';

const AssetManager = () => {
  const navigate = useNavigate();

  const onCreateAsset = () => navigate(PATHS.CREATE_ASSET);

  return (
    <StyledAssetManager>
      <AssetManagerNavigation onCreateAsset={onCreateAsset} />
      <AssetManagerTable />
    </StyledAssetManager>
  );
};

export default AssetManager;
