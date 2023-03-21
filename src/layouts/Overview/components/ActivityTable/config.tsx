import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  HISTORICAL_COLUMNS,
  EActivityTableTabs,
  IHistoricalItem,
  ITokenItem,
  TOKEN_COLUMNS,
} from './constants';
import { StatusLabel, IdCellWrapper, IconWrapper } from './styles';
import { Icon } from '~/components';

interface IIdData {
  eventId: string;
  blockId: string;
  extrinsicIdx: number | null;
}

const createTokenActivityLink = (data: IIdData) => {
  if (!data) return '';

  if (!data.extrinsicIdx) {
    return `${import.meta.env.VITE_SUBSCAN_URL}block/${
      data.blockId
    }?tab=event&&event=${data.eventId}`;
  }

  return `${import.meta.env.VITE_SUBSCAN_URL}extrinsic/${data.blockId}-${
    data.extrinsicIdx
  }?event=${data.eventId}`;
};

const columns = {
  [EActivityTableTabs.HISTORICAL_ACTIVITY]: HISTORICAL_COLUMNS.map(
    ({ header, accessor }) => {
      const key = accessor as keyof IHistoricalItem;
      const columnHelper = createColumnHelper<IHistoricalItem>();
      return columnHelper.accessor(key, {
        header: () => header,
        cell: (info) => {
          if (accessor === 'extrinsicIdx') {
            const extrinsicIdx = info.getValue();
            const blockNumber = info.row.getValue('blockNumber');
            const computedId = `${blockNumber}-${extrinsicIdx}`;
            const handleClick = () =>
              window.open(
                `${import.meta.env.VITE_SUBSCAN_URL}extrinsic/${computedId}`,
                '_blank',
              );
            return (
              <IdCellWrapper onClick={handleClick}>
                <IconWrapper>
                  <Icon name="ArrowTopRight" />
                </IconWrapper>
                {computedId}
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
    },
  ),
  [EActivityTableTabs.TOKEN_ACTIVITY]: TOKEN_COLUMNS.map(
    ({ header, accessor }) => {
      const key = accessor as keyof IHistoricalItem;
      const columnHelper = createColumnHelper<ITokenItem>();
      return columnHelper.accessor(key, {
        header: () => header,
        cell: (info) => {
          const data = info.getValue();
          if (key !== 'id') return data;

          const handleClick = () =>
            window.open(createTokenActivityLink(data), '_blank');
          return (
            <IdCellWrapper onClick={handleClick}>
              <IconWrapper>
                <Icon name="ArrowTopRight" />
              </IconWrapper>
              {data?.eventId}
            </IdCellWrapper>
          );
        },
      });
    },
  ),
};

export const useActivityTable = (currentTab: EActivityTableTabs) => {
  const [tableData, setTableData] = useState<ITableItem[]>([]);
  return {
    table: useReactTable({
      data: tableData,
      columns: columns[currentTab],
      initialState: {
        pagination: {
          pageSize: 10,
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
