import {
  DefaultPortfolio,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  IFungibleAsset,
  INonFungibleAsset,
} from '~/components/AssetForm/constants';

export interface ISelectedLegFungible extends IFungibleAsset {
  from: DefaultPortfolio | NumberedPortfolio | string;
  to: DefaultPortfolio | NumberedPortfolio | string;
  index: number;
}

export interface ISelectedLegNonFungible extends INonFungibleAsset {
  from: DefaultPortfolio | NumberedPortfolio | string;
  to: DefaultPortfolio | NumberedPortfolio | string;
  index: number;
}

export type TSelectedLeg = ISelectedLegFungible | ISelectedLegNonFungible;
