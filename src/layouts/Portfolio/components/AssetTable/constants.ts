export interface ITokenItem {
  ticker: string;
  percentage: number;
  balance: {
    amount: number;
    ticker: string;
  };
}

export interface ITransactionItem {
  id: string;
  dateTime: string;
  from: string;
  to: string;
  direction: string;
  amount: string;
  asset: string;
}

export interface IMovementItem {
  id: string;
  dateTime: string;
  from: string;
  to: string;
  amount: string;
  asset: string;
}

export type AssetTableItem = ITokenItem | ITransactionItem | IMovementItem;

export enum EAssetsTableTabs {
  TOKENS = 'tokens',
  TRANSACTIONS = 'transactions',
  MOVEMENTS = 'movements',
}

interface IMovementResponseItem {
  id: string;
  amount: string;
  assetId: string;
  createdBlock: {
    blockId: number;
    datetime: string;
  };
  from: {
    name: string | null;
  };
  to: {
    name: string | null;
  };
}

interface IPortfolioMovements {
  nodes: IMovementResponseItem[];
  totalCount: number;
}

export interface IMovementQueryResponse {
  portfolioMovements: IPortfolioMovements;
}
