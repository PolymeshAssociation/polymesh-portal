import React from 'react';
import { useParams } from 'react-router-dom';
import { useAssetDetails } from '~/hooks/polymesh/useAssetDetails';
import { LoadingFallback } from '~/components';
import { AssetSnapshot } from './components/AssetSnapshot';
import { AssetTabsContainer } from './components/AssetTabsContainer';
import { AssetActionsProvider } from './context';
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
    <AssetActionsProvider
      assetInstance={asset}
      onTransactionSuccess={reloadAssetDetails}
      refreshAssetDetails={reloadAssetDetails}
    >
      <Container>
        <AssetSnapshot asset={assetDetails} isLoading={assetDetailsLoading} />
        <AssetTabsContainer asset={assetDetails} />
      </Container>
    </AssetActionsProvider>
  );
};

export default AssetControlCenter;
