export interface ITokenItem {
  ticker: string;
  percentage: number;
  balance: {
    amount: number;
    ticker: string;
  };
}
