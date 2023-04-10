import { ITransferEvent } from '~/constants/queries/types';

export interface IIdData {
  eventId: string;
  blockId: string;
  extrinsicIdx: number | null;
}

export interface ITokenItem {
  ticker: string;
  percentage: number;
  balance: {
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

interface ITransferEvents {
  nodes: ITransferEvent[];
  totalCount: number;
}

export interface IMovementQueryResponse {
  portfolioMovements: IPortfolioMovements;
}

export interface ITransferQueryResponse {
  events: ITransferEvents;
}
