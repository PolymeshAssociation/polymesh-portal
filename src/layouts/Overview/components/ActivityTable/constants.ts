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
    header: 'Block',
    accessor: 'blockNumber',
  },
  {
    header: 'Legs',
    accessor: 'legs',
  },
  {
    header: 'Venue',
    accessor: 'venueId',
  },
];

export interface IHistoricalItem {
  extrinsicIdx: string;
  blockNumber: string;
  module: string;
  call: string;
  success: boolean;
}

export interface ITokenItem {
  id: string;
  blockNumber: string;
  legs: string;
  venueId: string;
}

export enum EActivityTableTabs {
  HISTORICAL_ACTIVITY = 'historical',
  TOKEN_ACTIVITY = 'token',
}
