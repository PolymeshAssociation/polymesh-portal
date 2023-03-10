export const COL_DATA = [
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

export interface ITableItem {
  extrinsicIdx: string;
  blockNumber: string;
  module: string;
  call: string;
  success: boolean;
}
