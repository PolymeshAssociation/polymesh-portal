import { createColumnHelper } from '@tanstack/react-table';
import { IIdData, IHistoricalDistribution } from './constants';
import { IdCellWrapper, IconWrapper } from './styles';
import { Icon } from '~/components';

const createIdLink = (data: IIdData | undefined) => {
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

const columnHelper = createColumnHelper<IHistoricalDistribution>();

export const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => {
      const data = info.getValue();
      const handleClick = () =>
        window.open(createIdLink(data as IIdData), '_blank');
      return (
        <IdCellWrapper onClick={handleClick}>
          <IconWrapper>
            <Icon name="ArrowTopRight" />
          </IconWrapper>
          {(data as IIdData)?.eventId}
        </IdCellWrapper>
      );
    },
  }),
  columnHelper.accessor('dateTime', {
    header: 'Date',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('asset', {
    header: 'Asset',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('currency', {
    header: 'Distribution Asset',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('perShare', {
    header: 'Per Share',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('tax', {
    header: 'Tax',
    cell: (info) => {
      const tax = info.getValue();
      return <>{tax ? tax * 100 : 0}%</>;
    },
  }),
];
