export interface IIdData {
  eventId: string;
  blockId: string;
}

export interface IDetails {
  amount: number;
  taxPercentage: number;
  perShare: number;
  distributionId: string;
  portfolio: {
    did: string;
    id: number;
    name: string | null;
  };
}

export interface IHistoricalDistribution {
  id: IIdData;
  dateTime: string;
  asset: string;
  currency: string;
  amountAfterTax: number;
  details: IDetails;
}
