import { useContext, useEffect, useState } from 'react';
import {
  Asset,
  AssetDocument,
  CollectionKey,
  MetadataLockStatus,
  SecurityIdentifier,
} from '@polymeshassociation/polymesh-sdk/types';
import { NftCollection } from '@polymeshassociation/polymesh-sdk/internal';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import { hexToUuid, splitCamelCase, uuidToHex } from '~/helpers/formatters';
import { toFormattedTimestamp } from '~/helpers/dateTime';

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

export const useAssetDetails = (assetIdentifier: Asset | string | null) => {
  const [assetDetailsLoading, setAssetDetailsLoading] = useState(true);
  const [assetDetails, setAssetDetails] = useState<IAssetDetails>();

  const {
    api: { sdk, gqlClient },
  } = useContext(PolymeshContext);

  useEffect(() => {
    if (!sdk || !gqlClient || !assetIdentifier) {
      return;
    }
    setAssetDetailsLoading(true);

    (async () => {
      try {
        let asset: Asset;
        if (typeof assetIdentifier === 'string') {
          if (assetIdentifier.length <= 12) {
            asset = await sdk.assets.getAsset({
              ticker: assetIdentifier,
            });
          } else {
            let assetId: string;
            if (!assetIdentifier.startsWith('0x')) {
              assetId = uuidToHex(assetIdentifier);
            } else {
              assetId = assetIdentifier;
            }
            asset = await sdk.assets.getAsset({
              assetId,
            });
          }
        } else {
          asset = assetIdentifier;
        }
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

        const {
          isDivisible,
          assetType,
          name,
          nonFungible: isNftCollection,
          owner,
          totalSupply,
          ticker,
        } = details;

        const metaData = (
          await Promise.all(
            meta.map(async (entry) => {
              const value = await entry.value();
              const metaDetails = await entry.details();

              let lockedUntil: string | undefined;
              if (value?.lockStatus === MetadataLockStatus.LockedUntil) {
                lockedUntil = toFormattedTimestamp(
                  value?.lockedUntil,
                  'YYYY-MM-DD / HH:mm:ss',
                );
              }
              return {
                name: splitCamelCase(metaDetails.name),
                description: metaDetails.specs.description,
                expiry: value?.expiry
                  ? toFormattedTimestamp(value?.expiry, 'YYYY-MM-DD / HH:mm:ss')
                  : null,
                lockedUntil,
                isLocked: value?.lockStatus
                  ? splitCamelCase(value?.lockStatus)
                  : null,
                value: value?.value || null,
              };
            }),
          )
        ).filter((entry) => entry.value !== null);
        setAssetDetails({
          assetId: hexToUuid(asset.id),
          details: {
            assetIdentifiers,
            assetType,
            collectionId: collectionId?.toNumber(),
            collectionKeys,
            createdAt: createdAtInfo?.blockDate || null,
            fundingRound,
            holderCount: assetHolderCount.toNumber(),
            isDivisible,
            isNftCollection,
            metaData,
            name,
            owner: owner.did,
            ticker: ticker || '',
            totalSupply: totalSupply.toNumber(),
            requiredMediators: requiredMediators.map(
              (identity) => identity.did,
            ),
            venueFilteringEnabled: venueFilteringDetails.isEnabled,
            permittedVenuesIds: venueFilteringDetails.allowedVenues.map(
              (venue) => venue.id.toString(),
            ),
            isFrozen: assetIsFrozen,
          },
          docs: docs.data,
        });
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setAssetDetailsLoading(false);
      }
    })();
  }, [gqlClient, sdk, assetIdentifier]);

  return { assetDetails, assetDetailsLoading };
};
