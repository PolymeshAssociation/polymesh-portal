import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { IPortfolioData } from '~/context/PortfolioContext/constants';

export interface IMoveAssetsProps {
  portfolio: IPortfolioData;
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}

export interface IAssetItem {
  asset: string;
  amount: BigNumber;
}

export interface ISelectedAsset {
  index: number;
  asset: string;
  amount: number;
}
