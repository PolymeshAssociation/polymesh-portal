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
