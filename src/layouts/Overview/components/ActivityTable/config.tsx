import { createColumnHelper } from '@tanstack/react-table';

import {
  HISTORICAL_COLUMNS,
  EActivityTableTabs,
  IHistoricalItem,
  ITokenItem,
  IIdData,
  TOKEN_COLUMNS,
  INftTransactionItem,
} from './constants';
import { StatusLabel, IdCellWrapper, IconWrapper, StyledTime } from './styles';
import { Icon } from '~/components';
import { IdCell } from '~/layouts/Portfolio/components/NftAssetTable/components/IdCell';
import { DateCell } from '~/layouts/Portfolio/components/NftAssetTable/components/DateCell';
import { NftIdsCell } from '~/layouts/Portfolio/components/NftAssetTable/components/NftIdsCell';
import { AddressCell } from '~/layouts/Portfolio/components/NftAssetTable/components/AddressCell';

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

const transactionColumnHelper = createColumnHelper<INftTransactionItem>();

export const columns = {
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
              <StatusLabel $success>Success</StatusLabel>
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
            const link = createTokenActivityLink(data as IIdData);
            return (
              <IdCell
                link={link}
                label={(data as IIdData)?.instructionId || '-'}
              />
            );
          }

          if (key === 'dateTime') {
            if (!data) return '';
            return <DateCell data={data as string} />;
          }

          if (key === 'to' || key === 'from') {
            return <AddressCell address={data as string} />;
          }

          return data;
        },
      });
    },
  ),
  [EActivityTableTabs.NFT_ACTIVITY]: [
    transactionColumnHelper.accessor('txId', {
      header: 'Instruction Id',
      enableSorting: false,
      cell: (info) => {
        const data = info.getValue();
        const link = createTokenActivityLink(data as IIdData);
        return <IdCell link={link} label={data?.instructionId || '-'} />;
      },
    }),
    transactionColumnHelper.accessor('dateTime', {
      header: 'Date / Time',
      cell: (info) => <DateCell data={info.getValue()} />,
    }),
    transactionColumnHelper.accessor('from', {
      header: 'From',
      cell: (info) => <AddressCell address={info.getValue()} />,
    }),
    transactionColumnHelper.accessor('to', {
      header: 'To',
      cell: (info) => <AddressCell address={info.getValue()} />,
    }),
    transactionColumnHelper.accessor('assetId', {
      header: 'Collection',
      cell: (info) => info.getValue(),
    }),
    transactionColumnHelper.accessor('nftIds', {
      header: 'Token IDs',
      cell: (info) => <NftIdsCell info={info} />,
    }),
  ],
};
