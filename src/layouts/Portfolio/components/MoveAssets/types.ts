import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { IPortfolioData } from '~/context/PortfolioContext/constants';

export enum EAssetType {
  FUNGIBLE = 'Fungible Assets',
  NON_FUNFIBLE = 'Non-fungible Assets',
}

export interface IMoveAssetsProps {
  portfolio: IPortfolioData;
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}

export interface IAssetItem {
  asset: string;
  amount: BigNumber;
  memo?: string;
}
