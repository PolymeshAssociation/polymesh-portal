import { useState, useEffect } from 'react';
import {
  NftCollection,
  PortfolioBalance,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  ICombinedPortfolioData,
  IPortfolioData,
} from '~/context/PortfolioContext/constants';
import { TSelectedAsset, INft } from '../constants';
import { parseCollections } from '../helpers';
import { notifyError } from '~/helpers/notifications';

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
  portfolio: IPortfolioData | ICombinedPortfolioData | null,
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
    const currentAsset = portfolio?.assets.find(
      (item) => item.asset.id === asset,
    );
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
    if (!portfolio) {
      return;
    }

    (async () => {
      try {
        const { collections: parsedCollections, nfts: parsedNfts } =
          await parseCollections(portfolio);
        setCollections(parsedCollections);
        setNfts(parsedNfts);
      } catch (error) {
        notifyError((error as Error).message);
      }
    })();
  }, [portfolio]);

  return {
    assets: portfolio?.assets || [],
    collections,
    nfts,
    selectedAssets,
    getNftsPerCollection,
    getAssetBalance,
    handleAddAsset,
    handleDeleteAsset,
    handleSelectAsset,
    portfolioName: portfolio?.name || '',
  };
};
