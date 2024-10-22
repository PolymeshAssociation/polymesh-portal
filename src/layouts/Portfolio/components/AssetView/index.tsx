import { useSearchParamAssetDetails } from '~/hooks/polymesh/useSearchParamAssetDetails';
import { Breadcrumbs } from '../Breadcrumbs';
import { StyledAssetContainer } from './styles';
import { AssetDetailsCard } from '~/components/AssetDetailsCard';

export const AssetView = () => {
  const { assetDetails, assetDetailsLoading } = useSearchParamAssetDetails();

  return (
    <StyledAssetContainer>
      <Breadcrumbs />
      <AssetDetailsCard
        assetDetails={assetDetails}
        assetDetailsLoading={assetDetailsLoading}
      />
    </StyledAssetContainer>
  );
};
