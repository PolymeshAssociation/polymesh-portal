import { BigNumber } from '@polymeshassociation/polymesh-sdk';

export enum EAssetType {
  FUNGIBLE = 'Fungible Assets',
  NON_FUNFIBLE = 'Non-fungible Assets',
}

export interface IAsset {
  asset: string;
  memo?: string;
}

export interface IFungibleAsset extends IAsset {
  amount: BigNumber;
}

export interface INonFungibleAsset extends IAsset {
  nfts: BigNumber[];
}

export type TSelectedAsset = IFungibleAsset | INonFungibleAsset;

export interface INft {
  id: BigNumber;
  imgUrl: string;
}

export interface IParsedCollectionData {
  collections: string[];
  nfts: Record<string, INft[]>;
}

export const MAX_NFTS_PER_LEG = 10;
