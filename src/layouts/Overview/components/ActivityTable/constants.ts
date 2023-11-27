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

export const TOKEN_COLUMNS = [
  {
    header: 'Instruction ID',
    accessor: 'id',
  },
  {
    header: 'Date / Time',
    accessor: 'dateTime',
  },
  {
    header: 'From',
    accessor: 'from',
  },
  { header: 'To', accessor: 'to' },
  { header: 'Asset', accessor: 'asset' },
  { header: 'Amount', accessor: 'amount' },
];

export interface IIdData {
  eventId: string;
  blockId: string;
  extrinsicIdx: number | null;
  instructionId: string | null;
}

export interface ITokenItem {
  id: IIdData;
  dateTime: string;
  from: string;
  to: string;
  amount: string;
  asset: string;
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
}

export enum EActivityTableTabs {
  HISTORICAL_ACTIVITY = 'historical',
  TOKEN_ACTIVITY = 'Fungible assets',
  NFT_ACTIVITY = 'NFT Collections',
}
