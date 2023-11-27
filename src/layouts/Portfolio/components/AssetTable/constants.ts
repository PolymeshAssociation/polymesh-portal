export interface IIdData {
  eventId: string;
  blockId: string;
  extrinsicIdx: number | null;
  instructionId: string | null;
}

export interface ITokenItem {
  ticker: string;
  percentage: number;
  balance: {
    amount: number;
    ticker: string;
  };
  locked: {
    amount: number;
    ticker: string;
  };
}

export interface ITransactionItem {
  id: IIdData;
  dateTime: string;
  from: string;
  to: string;
  amount: string;
  asset: string;
}

export interface IMovementItem {
  movementId: string;
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
