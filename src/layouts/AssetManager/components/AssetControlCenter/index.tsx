import React from 'react';
import { useParams } from 'react-router-dom';
import { useAssetDetails } from '~/hooks/polymesh/useAssetDetails';
import { LoadingFallback } from '~/components';
import { AssetSnapshot } from './components/AssetSnapshot';
import { AssetTabsContainer } from './components/AssetTabsContainer';
import { Container } from './styles';
import NotFound from '~/layouts/NotFound';

export const AssetControlCenter = () => {
  const { assetId } = useParams();
  const { assetDetails, assetDetailsLoading, reloadAssetDetails, asset } =
    useAssetDetails(assetId);

  if (!assetDetails?.details && assetDetailsLoading) {
    return <LoadingFallback />;
  }

  if (!assetDetails?.details) {
    return <NotFound />;
  }

  return (
    <Container>
      <AssetSnapshot
        asset={assetDetails}
        assetInstance={asset}
        onRefresh={reloadAssetDetails}
        isLoading={assetDetailsLoading}
      />
      <AssetTabsContainer asset={assetDetails} />
    </Container>
  );
};

export default AssetControlCenter;
