import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { useState } from 'react';
import { COL_DATA, ITableItem } from './constants';
import { StatusLabel, IdCellWrapper, IconWrapper } from './styles';
import { Icon } from '~/components';

const columnHelper = createColumnHelper<ITableItem>();

const columns = COL_DATA.map(({ header, accessor }) => {
  const key = accessor as keyof ITableItem;
  return columnHelper.accessor(key, {
    header: () => header,
    cell: (info) => {
      if (accessor === 'extrinsicIdx') {
        const extrinsicIdx = info.getValue();
        const blockNumber = info.row.getValue('blockNumber');
        const handleClick = () =>
          window.open(
            `${
              import.meta.env.VITE_SUBSCAN_URL
            }extrinsic/${blockNumber}-${extrinsicIdx}`,
            '_blank',
          );
        return (
          <IdCellWrapper onClick={handleClick}>
            <IconWrapper>
              <Icon name="ArrowTopRight" />
            </IconWrapper>
            {extrinsicIdx}
          </IdCellWrapper>
        );
      }

      if (accessor === 'success') {
        return accessor ? (
          <StatusLabel success>Success</StatusLabel>
        ) : (
          <StatusLabel>Failure</StatusLabel>
        );
      }
      return info.getValue();
    },
  });
});

export const useActivityTable = () => {
  const [tableData, setTableData] = useState<ITableItem[]>([]);
  return {
    table: useReactTable({
      data: tableData,
      columns,
      initialState: {
        pagination: {
          pageSize: 3,
        },
      },
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      enableColumnFilters: true,
      getFilteredRowModel: getFilteredRowModel(),
    }),
    setTableData,
  };
};
