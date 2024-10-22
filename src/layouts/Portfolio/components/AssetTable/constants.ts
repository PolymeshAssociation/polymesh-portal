export interface IIdData {
  eventId: string;
  blockId: string;
  extrinsicIdx: number | null;
  instructionId: string | null;
}

export interface ITokenItem {
  assetId: string;
  tokenDetails: {
    assetId: string;
    name: string;
    ticker?: string;
  };
  percentage: number;
  balance: number;
  locked: number;
}

export interface ITransactionItem {
  id: IIdData;
  dateTime: string;
  from: string;
  to: string;
  amount: string;
  asset: string;
  tokenDetails: {
    name: string;
    ticker: string;
  };
}

export interface IMovementItem {
  movementId: string;
  dateTime: string;
  from: string;
  to: string;
  amount: string;
  assetId: string;
  tokenDetails: {
    name: string;
    ticker: string;
  };
}

export type AssetTableItem = ITokenItem | ITransactionItem | IMovementItem;

export enum EAssetsTableTabs {
  TOKENS = 'tokens',
  TRANSACTIONS = 'transactions',
  MOVEMENTS = 'movements',
}
