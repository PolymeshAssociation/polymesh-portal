import { useState, useEffect } from 'react';
import { PortfolioBalance } from '@polymeshassociation/polymesh-sdk/types';
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
  collections: string[];
  nfts: Record<string, INft[]>;
  portfolioName: string;
  getAssetBalance: (asset: string) => number;
  getNftsPerCollection: (ticker: string | null) => INft[];
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
  >(getInitialState(index?.toString()));

  const [collections, setCollections] = useState<string[]>([]);
  const [nfts, setNfts] = useState<Record<string, INft[]>>({});

  const getNftsPerCollection = (ticker: string | null) => {
    if (!ticker) return [];
    return nfts[ticker]?.sort((a, b) => a.id.toNumber() - b.id.toNumber());
  };

  const getAssetBalance = (asset: string) => {
    const currentAsset = portfolio?.assets.find(
      (item) => item.asset.ticker === asset,
    );
    const balance = currentAsset?.free.toNumber();
    return balance || 0;
  };

  const handleAddAsset = () =>
    setSelectedAssets((prev) => {
      const assetIndex = Object.keys(prev).length;
      return { ...prev, [assetIndex.toString()]: {} as TSelectedAsset };
    });

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
    assets: portfolio?.assets as PortfolioBalance[],
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
