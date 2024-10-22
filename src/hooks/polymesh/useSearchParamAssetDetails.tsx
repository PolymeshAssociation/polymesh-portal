import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAssetDetails } from './useAssetDetails';

export const useSearchParamAssetDetails = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const assetIdentifier =
    searchParams.get('asset') || searchParams.get('nftCollection');
  const { assetDetailsLoading, assetDetails } =
    useAssetDetails(assetIdentifier);

  // Effect to ensure the searchParam is for the correct asset type.
  useEffect(() => {
    if (!assetIdentifier || assetDetailsLoading || !assetDetails) {
      return;
    }

    if (searchParams.has('asset') && assetDetails.details?.isNftCollection) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('asset');
      newSearchParams.set('nftCollection', assetIdentifier);
      setSearchParams(newSearchParams.toString());
      return;
    }
    if (
      searchParams.has('nftCollection') &&
      !assetDetails.details?.isNftCollection
    ) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('nftCollection');
      newSearchParams.set('asset', assetIdentifier);
      setSearchParams(newSearchParams.toString());
    }
  }, [
    assetIdentifier,
    assetDetails,
    assetDetailsLoading,
    searchParams,
    setSearchParams,
  ]);

  return {
    assetDetailsLoading,
    assetDetails,
  };
};
