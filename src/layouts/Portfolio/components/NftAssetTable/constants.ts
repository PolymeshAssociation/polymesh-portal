import { Nft } from '@polymeshassociation/polymesh-sdk/types';

export enum ENftAssetsTableTabs {
  COLLECTIONS = 'collections',
  ALL_NFTS = 'all nfts',
  TRANSACTIONS = 'transactions',
  MOVEMENTS = 'movements',
}

export interface ICollectionItemTicker {
  imgUrl: string;
  ticker?: string;
}

export interface ICollectionItem {
  collectionId: string;
  ticker: ICollectionItemTicker;
  name: string;
  assetType: string;
  count: number;
}

export interface INftAssetItem {
  ticker: ICollectionItemTicker;
  id: number;
  collectionTicker: string;
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
}

export interface INftTransactionItem {
  txId: {
    eventId: string;
    blockId: string;
    extrinsicIdx: number | null;
    instructionId: string | null;
  };
  dateTime: string;
  from: string;
  to: string;
  nftIds: string[];
  assetId: string;
}

export type TNftTableItem =
  | ICollectionItem
  | INftAssetItem
  | INftMovementItem
  | INftTransactionItem;
