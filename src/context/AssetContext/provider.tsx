import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  useRef,
} from 'react';
import { NftCollection } from '@polymeshassociation/polymesh-sdk/internal';
import {
  Asset,
  MetadataLockStatus,
  GlobalMetadataKey,
} from '@polymeshassociation/polymesh-sdk/types';
import AssetContext from './context';
import { PolymeshContext } from '../PolymeshContext';
import { AccountContext } from '../AccountContext';
import { notifyGlobalError, notifyError } from '~/helpers/notifications';
import { AssetWithDetails, TickerReservationWithDetails } from './constants';
import { IAssetDetails } from '~/hooks/polymesh/useAssetDetails';
import { splitCamelCase } from '~/helpers/formatters';
import { toFormattedTimestamp } from '~/helpers/dateTime';

interface IProviderProps {
  children: React.ReactNode;
}

const AssetProvider = ({ children }: IProviderProps) => {
  const {
    api: { sdk, gqlClient },
  } = useContext(PolymeshContext);
  const { identity, identityLoading } = useContext(AccountContext);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [ownedAssets, setOwnedAssets] = useState<AssetWithDetails[]>([]);
  const [tickerReservations, setTickerReservations] = useState<
    TickerReservationWithDetails[]
  >([]);
  const [globalMetadata, setGlobalMetadata] = useState<GlobalMetadataKey[]>([]);

  // Cache for full asset details keyed by asset ID
  const assetFullDetailsCacheRef = useRef<{
    [assetId: string]: IAssetDetails;
  }>({});

  const fetchAssetDetails = useCallback(
    async (
      assetIdentifier: string | Asset,
      forceRefresh = false,
    ): Promise<IAssetDetails | undefined> => {
      if (!sdk || !gqlClient) return undefined;
      let asset;
      try {
        if (typeof assetIdentifier === 'string') {
          asset =
            assetIdentifier.length <= 12
              ? await sdk.assets.getAsset({ ticker: assetIdentifier })
              : await sdk.assets.getAsset({ assetId: assetIdentifier });
        } else {
          asset = assetIdentifier;
        }
      } catch (error) {
        notifyGlobalError((error as Error).message);
        return undefined;
      }
      if (!forceRefresh && assetFullDetailsCacheRef.current[asset.id]) {
        return assetFullDetailsCacheRef.current[asset.id];
      }
      try {
        const [
          details,
          collectionId,
          collectionKeys,
          fundingRound,
          assetIdentifiers,
          assetHolderCount,
          docs,
          createdAtInfo,
          meta,
          requiredMediators,
          venueFilteringDetails,
          assetIsFrozen,
        ] = await Promise.all([
          asset.details(),
          asset instanceof NftCollection ? asset.getCollectionId() : undefined,
          asset instanceof NftCollection ? asset.collectionKeys() : [],
          asset.currentFundingRound(),
          asset.getIdentifiers(),
          asset.investorCount(),
          asset.documents.get(),
          asset.createdAt(),
          asset.metadata.get(),
          asset.getRequiredMediators(),
          asset.getVenueFilteringDetails(),
          asset.isFrozen(),
        ]);

        const metaData = (
          await Promise.all(
            meta.map(async (entry) => {
              const value = await entry.value();
              const metaDetails = await entry.details();
              let lockedUntil: string | undefined;
              if (value?.lockStatus === MetadataLockStatus.LockedUntil) {
                lockedUntil = toFormattedTimestamp(
                  value.lockedUntil,
                  'YYYY-MM-DD / HH:mm:ss',
                );
              }
              return {
                name: splitCamelCase(metaDetails.name),
                description: metaDetails.specs.description,
                expiry: value?.expiry
                  ? toFormattedTimestamp(value.expiry, 'YYYY-MM-DD / HH:mm:ss')
                  : null,
                lockedUntil,
                isLocked: value?.lockStatus
                  ? splitCamelCase(value.lockStatus)
                  : null,
                value: value?.value || null,
              };
            }),
          )
        ).filter((entry) => entry.value !== null);

        const assetDetails: IAssetDetails = {
          assetId: asset.id,
          details: {
            assetIdentifiers,
            assetType: details.assetType,
            collectionId: collectionId ? collectionId.toNumber() : undefined,
            collectionKeys,
            createdAt: createdAtInfo?.blockDate || null,
            fundingRound,
            holderCount: assetHolderCount.toNumber(),
            isDivisible: details.isDivisible,
            isNftCollection: !!details.nonFungible,
            metaData,
            name: details.name,
            owner: details.owner.did,
            ticker: details.ticker || '',
            totalSupply: details.totalSupply.toNumber(),
            requiredMediators: requiredMediators.map((id) => id.did),
            venueFilteringEnabled: venueFilteringDetails.isEnabled,
            permittedVenuesIds: venueFilteringDetails.allowedVenues.map(
              (venue) => venue.id.toString(),
            ),
            isFrozen: assetIsFrozen,
          },
          docs: docs.data,
        };

        assetFullDetailsCacheRef.current[asset.id] = assetDetails;
        return assetDetails;
      } catch (error) {
        notifyError((error as Error).message);
        return undefined;
      }
    },
    [sdk, gqlClient],
  );

  const refreshGlobalMetadata = useCallback(async () => {
    if (!sdk) return;
    try {
      const keys = await sdk.assets.getGlobalMetadataKeys();
      setGlobalMetadata(keys);
    } catch (error) {
      notifyError((error as Error).message);
    }
  }, [sdk]);

  const refreshAssets = useCallback(async () => {
    if (!sdk || identityLoading) {
      setAssetsLoading(true);
      setOwnedAssets([]);
      setTickerReservations([]);
      return;
    }
    if (!identity) {
      setOwnedAssets([]);
      setTickerReservations([]);
      setAssetsLoading(false);
      return;
    }
    setAssetsLoading(true);
    let ownedAssetsWithDetails: AssetWithDetails[] = [];
    let reservationsWithDetails: TickerReservationWithDetails[] = [];

    try {
      const assets = await sdk.assets.getAssets({ owner: identity.did });
      ownedAssetsWithDetails = (await Promise.all(
        assets.map(async (asset) => {
          const detailsData = await asset.details();
          return Object.assign(asset, { ...detailsData });
        }),
      )) as AssetWithDetails[];
    } catch (error) {
      notifyError(
        `Failed to retrieve asset details: ${(error as Error).message}`,
      );
      ownedAssetsWithDetails = [];
    }

    try {
      const rawReservations = await sdk.assets.getTickerReservations({
        owner: identity.did,
      });
      reservationsWithDetails = (await Promise.all(
        rawReservations.map(async (reservation) => {
          const detailsData = await reservation.details();
          return Object.assign(reservation, { ...detailsData });
        }),
      )) as TickerReservationWithDetails[];
    } catch (error) {
      notifyError(
        `Failed to retrieve ticker reservations: ${(error as Error).message}`,
      );
      reservationsWithDetails = [];
    }

    setOwnedAssets(ownedAssetsWithDetails);
    setTickerReservations(reservationsWithDetails);
    setAssetsLoading(false);
  }, [sdk, identityLoading, identity]);

  useEffect(() => {
    refreshAssets();
  }, [refreshAssets]);

  useEffect(() => {
    refreshGlobalMetadata();
  }, [refreshGlobalMetadata]);

  const contextValue = useMemo(
    () => ({
      ownedAssets,
      assetsLoading,
      setOwnedAssets,
      refreshAssets,
      tickerReservations,
      fetchAssetDetails,
      globalMetadata,
      refreshGlobalMetadata,
    }),
    [
      ownedAssets,
      assetsLoading,
      refreshAssets,
      tickerReservations,
      fetchAssetDetails,
      globalMetadata,
      refreshGlobalMetadata,
    ],
  );

  return (
    <AssetContext.Provider value={contextValue}>
      {children}
    </AssetContext.Provider>
  );
};

export default AssetProvider;
