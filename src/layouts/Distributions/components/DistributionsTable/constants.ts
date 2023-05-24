export interface IIdData {
  eventId: string;
  blockId: string;
  extrinsicIdx: number | null;
}

export interface IHistoricalDistribution {
  id: IIdData;
  dateTime: string;
  asset: string;
  currency: string;
  amount: number;
  perShare: number;
  tax: number;
}
