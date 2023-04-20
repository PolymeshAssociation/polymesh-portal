import { Balance } from '@polymeshassociation/polymesh-sdk/types';

export interface IAddress {
  did: string;
}

export interface ITransferEvent {
  id: string;
  blockId: number;
  extrinsicIdx: number;
  block: {
    datetime: string;
  };
  attributes: {
    value: string | Balance | IAddress;
  }[];
}

interface IMovement {
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
  nodes: IMovement[];
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
