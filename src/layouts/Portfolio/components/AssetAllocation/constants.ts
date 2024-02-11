import type { FungibleAsset } from '@polymeshassociation/polymesh-sdk/types';

export interface IAssetOption {
  ticker: string;
  amount: number;
  color: string;
  asset: FungibleAsset;
  percentage: number;
}

export interface IReducedOption {
  ticker: string;
  percentage: number;
  color: string;
}
