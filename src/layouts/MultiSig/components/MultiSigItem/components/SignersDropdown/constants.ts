export const SIGNER_COLUMNS = [
  {
    header: 'Signer',
    accessor: 'address',
  },
  {
    header: 'Status',
    accessor: 'status',
  },
];

export interface ISignerItem {
  address: string;
  status: string;
}
