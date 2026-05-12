import {
  AccountCollection,
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

export interface ICombinedPortfolioData {
  name: string;
  id: string;
  portfolio: (DefaultPortfolio | NumberedPortfolio)[];
  custodian: Identity;
  assets: PortfolioBalance[];
}

export interface IAccountData {
  assets: PortfolioBalance[];
  collections: AccountCollection[];
}

export interface IPortfolioContext {
  defaultPortfolio: DefaultPortfolio | null;
  numberedPortfolios: NumberedPortfolio[];
  allPortfolios: IPortfolioData[];
  accountAssets: PortfolioBalance[];
  accountCollections: AccountCollection[];
  allAccountsData: Record<string, IAccountData>;
  custodiedPortfolios: IPortfolioData[];
  combinedPortfolios: ICombinedPortfolioData | null;
  totalAssetsAmount: number;
  portfolioLoading: boolean;
  portfolioError: string;
  getPortfoliosData: () => Promise<void>;
  getCustodiedPortfoliosData: () => Promise<void>;
}

export const initialState = {
  defaultPortfolio: null,
  numberedPortfolios: [],
  allPortfolios: [],
  accountAssets: [],
  accountCollections: [],
  allAccountsData: {},
  custodiedPortfolios: [],
  combinedPortfolios: null,
  totalAssetsAmount: 0,
  portfolioLoading: false,
  portfolioError: '',
  getPortfoliosData: async () => {},
  getCustodiedPortfoliosData: async () => {},
};
