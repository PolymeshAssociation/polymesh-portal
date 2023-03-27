import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  HISTORICAL_COLUMNS,
  EActivityTableTabs,
  IHistoricalItem,
  ITokenItem,
  IIdData,
  TOKEN_COLUMNS,
} from './constants';
import {
  StatusLabel,
  IdCellWrapper,
  IconWrapper,
  StyledTime,
  AddressCellWrapper,
} from './styles';
import { CopyToClipboard, Icon } from '~/components';
import { formatDid } from '~/helpers/formatters';

const createTokenActivityLink = (data: IIdData | undefined) => {
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
          const data = info.getValue();

          if (key === 'extrinsicId') {
            const handleClick = () =>
              window.open(
                `${import.meta.env.VITE_SUBSCAN_URL}extrinsic/${data}`,
                '_blank',
              );
            return (
              <IdCellWrapper onClick={handleClick}>
                <IconWrapper>
                  <Icon name="ArrowTopRight" />
                </IconWrapper>
                {data}
              </IdCellWrapper>
            );
          }

          if (key === 'success') {
            return data ? (
              <StatusLabel success>Success</StatusLabel>
            ) : (
              <StatusLabel>Failure</StatusLabel>
            );
          }

          if (key === 'dateTime') {
            if (!data) return '';
            const [date, time] = (data as string).split(' ');

            return (
              <span>
                {date} / <StyledTime>{time}</StyledTime>
              </span>
            );
          }

          return data;
        },
      });
    },
  ),
  [EActivityTableTabs.TOKEN_ACTIVITY]: TOKEN_COLUMNS.map(
    ({ header, accessor }) => {
      const key = accessor as keyof ITokenItem;
      const columnHelper = createColumnHelper<ITokenItem>();
      return columnHelper.accessor(key, {
        header: () => header,
        cell: (info) => {
          const data = info.getValue();

          if (key === 'id') {
            const handleClick = () =>
              window.open(createTokenActivityLink(data as IIdData), '_blank');
            return (
              <IdCellWrapper onClick={handleClick}>
                <IconWrapper>
                  <Icon name="ArrowTopRight" />
                </IconWrapper>
                {(data as IIdData)?.eventId}
              </IdCellWrapper>
            );
          }

          if (key === 'dateTime') {
            if (!data) return '';
            const [date, time] = (data as string).split(' ');

            return (
              <span>
                {date} / <StyledTime>{time}</StyledTime>
              </span>
            );
          }

          if (key === 'to' || key === 'from') {
            return (
              <AddressCellWrapper>
                {formatDid(data as string, 6, 6)}
                <CopyToClipboard value={data as string} />
              </AddressCellWrapper>
            );
          }

          return data;
        },
      });
    },
  ),
};

export const useActivityTable = <T extends IHistoricalItem | ITokenItem>(
  currentTab: `${EActivityTableTabs}`,
) => {
  const [tableData, setTableData] = useState<T[]>([]);
  return {
    table: useReactTable<T>({
      data: tableData,
      columns: columns[currentTab] as ColumnDef<T>[],
      initialState: {
        pagination: {
          pageSize: 10,
        },
      },
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      enableColumnFilters: true,
      enableSorting: false,
      getFilteredRowModel: getFilteredRowModel(),
    }),
    setTableData,
  };
};
