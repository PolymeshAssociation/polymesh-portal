import { PortfolioLike } from '@polymeshassociation/polymesh-sdk/types';
import { IFungibleAsset, INonFungibleAsset } from '~/components/AssetForm/constants';

export interface ISelectedLegFungible extends IFungibleAsset {
  from: PortfolioLike;
  to: PortfolioLike;
  index: number;
}

export interface ISelectedLegNonFungible extends INonFungibleAsset {
  from: PortfolioLike;
  to: PortfolioLike;
  index: number;
}


export type TSelectedLeg = ISelectedLegFungible | ISelectedLegNonFungible;
