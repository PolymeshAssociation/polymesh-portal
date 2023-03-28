import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import { useState } from 'react';
import { formatBalance } from '~/helpers/formatters';
import { PercentageFilter } from './components/PercentageFilter';
import { TickerCell } from './components/TickerCell';
import { ITokenItem } from './constants';

const columnHelper = createColumnHelper<ITokenItem>();

const columns = [
  columnHelper.accessor('ticker', {
    header: 'Token',
    enableSorting: false,
    cell: (info) => <TickerCell info={info} />,
  }),
  columnHelper.accessor('percentage', {
    header: (info) => <PercentageFilter info={info} />,
    enableSorting: true,
    cell: (info) => {
      const percentage = info.getValue();
      return `${formatBalance(percentage)}%`;
    },
  }),
  columnHelper.accessor('balance', {
    header: 'Balance',
    enableSorting: false,
    cell: (info) => {
      const balance = info.getValue();
      return `${balance.amount} ${balance.ticker}`;
    },
  }),
];

export const useAssetTable = <T extends ITokenItem>() => {
  const [tableData, setTableData] = useState<T[]>([]);
  return {
    table: useReactTable<T>({
      data: tableData,
      columns: columns as ColumnDef<T>[],
      initialState: {
        pagination: {
          pageSize: 10,
        },
      },
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
    }),
    setTableData,
  };
};
