export const HISTORICAL_COLUMNS = [
  {
    header: 'ID',
    accessor: 'extrinsicId',
  },
  {
    header: 'Date / Time',
    accessor: 'dateTime',
  },
  { header: 'Module', accessor: 'module' },
  { header: 'Call', accessor: 'call' },
  { header: 'Status', accessor: 'success' },
];

export interface IIdData {
  eventId: string;
  blockId: string;
  extrinsicIdx: number | null;
  instructionId: string | null;
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

export interface IHistoricalItem {
  extrinsicId: string;
  dateTime: string;
  module: string;
  call: string;
  success: boolean;
}

export interface INftTransactionItem {
  txId: IIdData;
  dateTime: string;
  from: string;
  to: string;
  nftIds: string[];
  assetId: string;
  nameAndTicker: {
    name: string;
    ticker: string;
  };
}

export enum EActivityTableTabs {
  HISTORICAL_ACTIVITY = 'historical',
  TOKEN_ACTIVITY = 'Fungible assets',
  NFT_ACTIVITY = 'NFT Collections',
}
