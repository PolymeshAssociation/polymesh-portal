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

export enum EAssetsTableTabs {
  TOKENS = 'tokens',
  TRANSACTIONS = 'transactions',
}
