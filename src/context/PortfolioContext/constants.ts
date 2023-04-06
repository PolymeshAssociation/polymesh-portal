import {
  DefaultPortfolio,
  Identity,
  NumberedPortfolio,
  PortfolioBalance,
} from '@polymeshassociation/polymesh-sdk/types';

export interface IPortfolioData {
  name: string;
  id: string | undefined;
  portfolio: DefaultPortfolio | NumberedPortfolio;
  custodian: Identity;
  assets: PortfolioBalance[];
}

export interface IPortfolioContext {
  defaultPortfolio: DefaultPortfolio | null;
  numberedPortfolios: NumberedPortfolio[];
  allPortfolios: IPortfolioData[];
  totalAssetsAmount: number;
  portfolioLoading: boolean;
  portfolioError: string;
  getPortfoliosData: () => Promise<void>;
}

export const initialState = {
  defaultPortfolio: null,
  numberedPortfolios: [],
  allPortfolios: [],
  totalAssetsAmount: 0,
  portfolioLoading: false,
  portfolioError: '',
  getPortfoliosData: async () => {},
};
