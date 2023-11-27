import { Breadcrumbs } from '../Breadcrumbs';
import { StyledAssetContainer } from './styles';
import { AssetDetailsCard } from '~/components/AssetDetailsCard';

export const AssetView = () => {
  return (
    <StyledAssetContainer>
      <Breadcrumbs />
      <AssetDetailsCard />
    </StyledAssetContainer>
  );
};
