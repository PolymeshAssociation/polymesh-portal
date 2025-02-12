import {
  DefaultPortfolio,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  IFungibleAsset,
  INonFungibleAsset,
} from '~/components/AssetForm/constants';

export interface ISelectedLegFungible extends IFungibleAsset {
  from: DefaultPortfolio | NumberedPortfolio;
  to: DefaultPortfolio | NumberedPortfolio;
  index: number;
}

export interface ISelectedLegNonFungible extends INonFungibleAsset {
  from: DefaultPortfolio | NumberedPortfolio;
  to: DefaultPortfolio | NumberedPortfolio;
  index: number;
}

export type TSelectedLeg = ISelectedLegFungible | ISelectedLegNonFungible;
