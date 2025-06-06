import { useCallback, useContext, useEffect, useState } from 'react';
import { Asset } from '@polymeshassociation/polymesh-sdk/types';
import { notifyError } from '~/helpers/notifications';
import AssetContext from '~/context/AssetContext/context';
import { PolymeshContext } from '~/context/PolymeshContext';
import { IAssetDetails } from '~/context/AssetContext/constants';

export const useAssetDetails = (assetIdentifier?: Asset | string | null) => {
  const [assetDetailsLoading, setAssetDetailsLoading] = useState(true);
  const [assetDetails, setAssetDetails] = useState<IAssetDetails>();
  const [asset, setAsset] = useState<Asset>();

  const { fetchAssetDetails, fetchAsset } = useContext(AssetContext);
  const {
    state: { initialized: sdkInitialized },
  } = useContext(PolymeshContext);

  const fetch = useCallback(
    async (forceRefresh = false) => {
      if (!assetIdentifier || !sdkInitialized) return;
      setAssetDetailsLoading(true);
      try {
        const [details, fetchedAsset] = await Promise.all([
          fetchAssetDetails(assetIdentifier, forceRefresh),
          typeof assetIdentifier === 'string'
            ? fetchAsset(assetIdentifier)
            : Promise.resolve(assetIdentifier),
        ]);
        setAssetDetails(details);
        setAsset(fetchedAsset);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setAssetDetailsLoading(false);
      }
    },
    [assetIdentifier, fetchAssetDetails, fetchAsset, sdkInitialized],
  );

  const reloadAssetDetails = useCallback(() => fetch(true), [fetch]);

  useEffect(() => {
    if (!assetIdentifier || !sdkInitialized) return;
    fetch();
  }, [assetIdentifier, fetch, sdkInitialized]);

  return { asset, assetDetails, assetDetailsLoading, reloadAssetDetails };
};
