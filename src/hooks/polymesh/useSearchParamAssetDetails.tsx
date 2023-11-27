import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAssetDetails } from './useAssetDetails';

export const useSearchParamAssetDetails = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const asset = searchParams.get('asset') || searchParams.get('nftCollection');
  const { assetDetailsLoading, assetDetails } = useAssetDetails(asset);

  // Effect to ensure the searchParam is for the correct asset type.
  useEffect(() => {
    if (!asset || assetDetailsLoading || !assetDetails) {
      return;
    }

    if (searchParams.has('asset') && assetDetails.details?.isNftCollection) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('asset');
      newSearchParams.set('nftCollection', asset);
      setSearchParams(newSearchParams.toString());
      return;
    }
    if (
      searchParams.has('nftCollection') &&
      !assetDetails.details?.isNftCollection
    ) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('nftCollection');
      newSearchParams.set('asset', asset);
      setSearchParams(newSearchParams.toString());
    }
  }, [asset, assetDetails, assetDetailsLoading, searchParams, setSearchParams]);

  return {
    assetDetailsLoading,
    assetDetails,
  };
};
