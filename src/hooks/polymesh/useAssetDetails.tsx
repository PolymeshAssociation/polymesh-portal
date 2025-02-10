import { useCallback, useContext, useEffect, useState } from 'react';
import {
  Asset,
  AssetDocument,
  CollectionKey,
  SecurityIdentifier,
} from '@polymeshassociation/polymesh-sdk/types';
import { notifyError } from '~/helpers/notifications';
import AssetContext from '~/context/AssetContext/context';
import { PolymeshContext } from '~/context/PolymeshContext';

export interface IAssetMeta {
  name: string;
  description?: string;
  expiry?: Date | string | null;
  isLocked?: string | null;
  lockedUntil?: string;
  value?: string | null;
}

export interface IDetails {
  assetIdentifiers: SecurityIdentifier[];
  assetType: string;
  collectionKeys: CollectionKey[];
  createdAt: Date | null;
  fundingRound: string | null;
  holderCount: number;
  isDivisible: boolean;
  isNftCollection: boolean;
  metaData: IAssetMeta[];
  name: string;
  owner: string;
  ticker?: string;
  totalSupply: number;
  collectionId?: number;
  requiredMediators: string[];
  venueFilteringEnabled: boolean;
  permittedVenuesIds: string[];
  isFrozen: boolean;
}
export interface IAssetDetails {
  assetId: string;
  details?: IDetails;
  docs?: AssetDocument[];
}

export const useAssetDetails = (assetIdentifier?: Asset | string | null) => {
  const [assetDetailsLoading, setAssetDetailsLoading] = useState(true);
  const [assetDetails, setAssetDetails] = useState<IAssetDetails>();

  const { fetchAssetDetails } = useContext(AssetContext);
  const {
    state: { initialized: sdkInitialized },
  } = useContext(PolymeshContext);

  const fetch = useCallback(
    async (forceRefresh = false) => {
      if (!assetIdentifier || !sdkInitialized) return;
      setAssetDetailsLoading(true);
      try {
        const details = await fetchAssetDetails(assetIdentifier, forceRefresh);
        setAssetDetails(details);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setAssetDetailsLoading(false);
      }
    },
    [assetIdentifier, fetchAssetDetails, sdkInitialized],
  );

  const reloadAssetDetails = useCallback(() => fetch(true), [fetch]);

  useEffect(() => {
    if (!assetIdentifier || !sdkInitialized) return;
    fetch();
  }, [assetIdentifier, fetch, sdkInitialized]);

  return { assetDetails, assetDetailsLoading, reloadAssetDetails };
};
