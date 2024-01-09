import { useContext, useEffect, useState } from 'react';
import {
  Asset,
  AssetDocument,
  CollectionKey,
  MetadataLockStatus,
  SecurityIdentifier,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  FungibleAsset,
  NftCollection,
} from '@polymeshassociation/polymesh-sdk/internal';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import { splitCamelCase } from '~/helpers/formatters';
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
  totalSupply: number;
  collectionId?: number;
}
export interface IAssetDetails {
  ticker: string;
  details?: IDetails;
  docs?: AssetDocument[];
}

export const useAssetDetails = (assetOrTicker: Asset | string | null) => {
  const [assetDetailsLoading, setAssetDetailsLoading] = useState(true);
  const [assetDetails, setAssetDetails] = useState<IAssetDetails>();

  const {
    api: { sdk, gqlClient },
  } = useContext(PolymeshContext);

  useEffect(() => {
    if (!sdk || !gqlClient || !assetOrTicker) {
      return;
    }
    setAssetDetailsLoading(true);

    (async () => {
      try {
        let asset: Asset;
        if (typeof assetOrTicker === 'string') {
          asset = await sdk.assets.getAsset({ ticker: assetOrTicker });
        } else {
          asset = assetOrTicker;
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
        ] = await Promise.all([
          asset.details(),
          asset instanceof NftCollection ? asset.getCollectionId() : undefined,
          asset instanceof NftCollection ? asset.collectionKeys() : [],
          // TODO: remove type guard once `currentFundingRound` is added to NftCollection
          asset instanceof FungibleAsset ? asset.currentFundingRound() : null,
          asset.getIdentifiers(),
          asset.investorCount(),
          asset.documents.get(),
          asset.createdAt(),
          asset.metadata.get(),
        ]);

        const {
          isDivisible,
          assetType,
          name,
          nonFungible: isNftCollection,
          owner,
          totalSupply,
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
          ticker: asset.ticker,
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
            totalSupply: totalSupply.toNumber(),
          },
          docs: docs.data,
        });
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setAssetDetailsLoading(false);
      }
    })();
  }, [gqlClient, sdk, assetOrTicker]);

  return { assetDetails, assetDetailsLoading };
};
