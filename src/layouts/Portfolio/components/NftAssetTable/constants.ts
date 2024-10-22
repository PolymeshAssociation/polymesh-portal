import { Nft } from '@polymeshassociation/polymesh-sdk/types';
import { INftTransactionItem } from '~/layouts/Overview/components/ActivityTable/constants';

export enum ENftAssetsTableTabs {
  COLLECTIONS = 'collections',
  ALL_NFTS = 'all nfts',
  TRANSACTIONS = 'transactions',
  MOVEMENTS = 'movements',
}

export interface ICollectionItemTicker {
  assetId: string;
  imgUrl: string;
  ticker?: string;
  name?: string;
}

export interface ICollectionItem {
  collectionAssetId: string;
  collectionId: string;
  ticker: ICollectionItemTicker;
  assetType: string;
  count: number;
}

export interface INftAssetItem {
  assetType: string;
  ticker: ICollectionItemTicker;
  nftId: number;
  collectionAssetId: string;
  collectionId: string;
  collectionTicker?: string;
  collectionName: string;
  isLocked: boolean;
  nft: Nft;
}

export interface INftMovementItem {
  movementId: string;
  collection: string;
  dateTime: string;
  from: string;
  to: string;
  nftIds: string[];
  nameAndTicker: {
    name: string;
    ticker: string;
  };
}

export type TNftTableItem =
  | ICollectionItem
  | INftAssetItem
  | INftMovementItem
  | INftTransactionItem;
