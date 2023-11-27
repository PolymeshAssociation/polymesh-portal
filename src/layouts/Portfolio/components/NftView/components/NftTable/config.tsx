import { createColumnHelper } from '@tanstack/react-table';
import { IdFilter } from './components/IdFilter';
import { IdCell } from './components/IdCell';
import { UrlCell } from './components/UrlCell';
import { StyledCell } from './components/UrlCell/styles';
import { INftTableItem } from './constants';

const columnHelper = createColumnHelper<INftTableItem>();

export const columns = [
  columnHelper.accessor('id', {
    header: (info) => <IdFilter info={info} />,
    cell: (info) => <IdCell info={info.getValue()} />,
    enableSorting: true,
  }),
  columnHelper.accessor('isLocked', {
    header: 'Status',
    cell: (info) => {
      const data = info.getValue();
      return data ? 'Locked' : 'Free';
    },
  }),
  columnHelper.accessor('imgUrl', {
    header: () => <StyledCell>Image Url</StyledCell>,
    cell: (info) => <UrlCell imgUrl={info.getValue()} />,
  }),
];
