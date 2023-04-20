import { PortfolioLike } from '@polymeshassociation/polymesh-sdk/types';

export interface ISelectedAsset {
  index: number;
  asset: string;
  amount: number;
}

export interface ISelectedLeg {
  index: number;
  asset: string;
  amount: number;
  from: PortfolioLike;
  to: PortfolioLike;
}
