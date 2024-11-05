import { createColumnHelper } from '@tanstack/react-table';
import { IIdData, IHistoricalDistribution } from './constants';
import { IdCellWrapper, IconWrapper } from './styles';
import { Icon } from '~/components';
import { Details } from './components/Details';
import { AssetIdCell } from '~/components/AssetIdCell';

const createIdLink = (data: IIdData | undefined) => {
  if (!data) return '';

  return `${import.meta.env.VITE_SUBSCAN_URL}block/${
    data.blockId
  }?tab=event&&event=${data.eventId}`;
};

const columnHelper = createColumnHelper<IHistoricalDistribution>();

export const columns = [
  columnHelper.accessor('id', {
    header: 'Event ID',
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
    cell: (info) => <AssetIdCell assetId={info.getValue()} />,
  }),
  columnHelper.accessor('currency', {
    header: 'Distribution Asset',
    cell: (info) => <AssetIdCell assetId={info.getValue().id} />,
  }),
  columnHelper.accessor('amountAfterTax', {
    header: 'Amount After Tax',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('details', {
    header: 'Details',
    cell: (info) => {
      const data = info.getValue();
      // return <>{tax ? tax * 100 : 0}%</>;
      return data ? <Details data={data} /> : null;
    },
  }),
];
