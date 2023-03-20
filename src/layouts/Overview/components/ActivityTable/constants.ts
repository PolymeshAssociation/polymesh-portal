export const HISTORICAL_COLUMNS = [
  {
    header: 'ID',
    accessor: 'extrinsicIdx',
  },
  {
    header: 'Block',
    accessor: 'blockNumber',
  },
  { header: 'Module', accessor: 'module' },
  { header: 'Call', accessor: 'call' },
  { header: 'Status', accessor: 'success' },
];

export const TOKEN_COLUMNS = [
  {
    header: 'ID',
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
  { header: 'Amount', accessor: 'amount' },
  { header: 'Asset', accessor: 'asset' },
];

export interface ITokenItem {
  id: string;
  dateTime: string;
  from: string;
  to: string;
  amount: string;
  asset: string;
}

export interface IHistoricalItem {
  extrinsicIdx: string;
  blockNumber: string;
  module: string;
  call: string;
  success: boolean;
}

export enum EActivityTableTabs {
  HISTORICAL_ACTIVITY = 'historical',
  TOKEN_ACTIVITY = 'token',
}
