import {
  AccountCollection,
  NftCollection,
  PortfolioBalance,
} from '@polymeshassociation/polymesh-sdk/types';
import { useEffect, useState } from 'react';
import {
  ICombinedPortfolioData,
  IPortfolioData,
} from '~/context/PortfolioContext/constants';
import { notifyError } from '~/helpers/notifications';
import { INft, TSelectedAsset } from '../constants';
import { parseCollections, parseNftsFromCollection } from '../helpers';

export interface IAccountAssetSource {
  name: string;
  address: string;
  assets: PortfolioBalance[];
  accountCollections: AccountCollection[];
}

type TSelectedAssets = Record<string, TSelectedAsset>;

const getInitialState = (index: string) => ({
  [index]: {} as TSelectedAsset,
});

interface IAssetForm {
  assets: PortfolioBalance[];
  selectedAssets: TSelectedAssets;
  collections: NftCollection[];
  nfts: Record<string, INft[]>;
  portfolioName: string;
  getAssetBalance: (asset: string) => number;
  getNftsPerCollection: (collectionId?: string) => INft[];
  handleAddAsset: () => void;
  handleDeleteAsset: (index: string) => void;
  handleSelectAsset: (index: string, item?: Partial<TSelectedAsset>) => void;
}

export const useAssetForm = (
  source: IPortfolioData | ICombinedPortfolioData | IAccountAssetSource | null,
  index: number = 0,
): IAssetForm => {
  const [selectedAssets, setSelectedAssets] = useState<
    Record<string, TSelectedAsset>
  >(getInitialState(index.toString()));
  const [currentIndex, setCurrentIndex] = useState(index);

  const [collections, setCollections] = useState<NftCollection[]>([]);
  const [nfts, setNfts] = useState<Record<string, INft[]>>({});

  const getNftsPerCollection = (collectionId?: string) => {
    if (!collectionId) return [];
    return nfts[collectionId]?.sort(
      (a, b) => a.id.toNumber() - b.id.toNumber(),
    );
  };

  const getAssetBalance = (asset: string) => {
    const currentAsset = source?.assets.find((item) => item.asset.id === asset);
    const balance = currentAsset?.free.toNumber();
    return balance || 0;
  };

  const handleAddAsset = () => {
    setSelectedAssets((prevSelectedAssets) => {
      const nextAssetIndex = currentIndex + 1;
      return { ...prevSelectedAssets, [nextAssetIndex]: {} as TSelectedAsset };
    });
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleDeleteAsset = (deleteIndex: string) =>
    setSelectedAssets((prev) => {
      const { [deleteIndex]: deletedItem, ...rest } = prev;
      return rest;
    });

  const handleSelectAsset = (
    selectedIndex: string,
    item?: Partial<TSelectedAsset>,
  ) => {
    setSelectedAssets((prev) => ({
      ...prev,
      [selectedIndex]: item
        ? { ...prev[selectedIndex], ...(item as TSelectedAsset) }
        : ({} as TSelectedAsset),
    }));
  };

  useEffect(() => {
    if (!source) {
      return;
    }

    if ('accountCollections' in source) {
      (async () => {
        try {
          const nftRecord: Record<string, INft[]> = {};
          const parsedCollections: NftCollection[] = [];
          await Promise.all(
            source.accountCollections.map(
              async ({ collection, free, locked }) => {
                parsedCollections.push(collection);
                nftRecord[collection.id] = await parseNftsFromCollection(
                  free,
                  locked,
                );
              },
            ),
          );
          setCollections(parsedCollections);
          setNfts(nftRecord);
        } catch (error) {
          notifyError((error as Error).message);
        }
      })();
      return;
    }

    (async () => {
      try {
        const { collections: parsedCollections, nfts: parsedNfts } =
          await parseCollections(source);
        setCollections(parsedCollections);
        setNfts(parsedNfts);
      } catch (error) {
        notifyError((error as Error).message);
      }
    })();
  }, [source]);

  return {
    assets: source?.assets || [],
    collections,
    nfts,
    selectedAssets,
    getNftsPerCollection,
    getAssetBalance,
    handleAddAsset,
    handleDeleteAsset,
    handleSelectAsset,
    portfolioName: source?.name || '',
  };
};
