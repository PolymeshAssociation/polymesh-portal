import type { FungibleAsset } from '@polymeshassociation/polymesh-sdk/types';

export interface IAssetOption {
  assetId: string;
  amount: number;
  color: string;
  asset: FungibleAsset;
  percentage: number;
}

export interface IReducedOption {
  assetId: string;
  percentage: number;
  color: string;
}
