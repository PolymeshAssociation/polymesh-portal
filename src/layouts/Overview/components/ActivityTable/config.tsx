import { createColumnHelper } from '@tanstack/react-table';

import {
  HISTORICAL_COLUMNS,
  EActivityTableTabs,
  IHistoricalItem,
  IIdData,
  INftTransactionItem,
} from './constants';
import { StatusLabel, IdCellWrapper, IconWrapper, StyledTime } from './styles';
import { Icon } from '~/components';
import { IdCell } from '~/layouts/Portfolio/components/NftAssetTable/components/IdCell';
import { DateCell } from '~/layouts/Portfolio/components/NftAssetTable/components/DateCell';
import { NftIdsCell } from '~/layouts/Portfolio/components/NftAssetTable/components/NftIdsCell';
import { AddressCell } from '~/layouts/Portfolio/components/NftAssetTable/components/AddressCell';
import { AssetIdCell } from '~/components/AssetIdCell';
import { ITransactionItem } from '~/layouts/Portfolio/components/AssetTable/constants';

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

const transactionColumnHelper = createColumnHelper<ITransactionItem>();
const nftTransactionColumnHelper = createColumnHelper<INftTransactionItem>();

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
  [EActivityTableTabs.TOKEN_ACTIVITY]: [
    transactionColumnHelper.accessor('id', {
      header: 'Instruction Id',
      enableSorting: false,
      cell: (info) => {
        const data = info.getValue();
        const link = createTokenActivityLink(data);
        return <IdCell link={link} label={data?.instructionId || '-'} />;
      },
    }),
    transactionColumnHelper.accessor('dateTime', {
      header: 'Date / Time',
      cell: (info) => {
        const data = info.getValue();
        if (!data) return '';
        return <DateCell data={data} />;
      },
    }),
    transactionColumnHelper.accessor('from', {
      header: 'From',
      cell: (info) => {
        const data = info.getValue();
        return <AddressCell address={data as string} />;
      },
    }),
    transactionColumnHelper.accessor('to', {
      header: 'To',
      cell: (info) => {
        const data = info.getValue();
        return <AddressCell address={data as string} />;
      },
    }),
    transactionColumnHelper.accessor('tokenDetails', {
      header: 'Name',
      enableSorting: false,
      cell: (info) => {
        const tokenDetails = info.getValue();
        return `${tokenDetails?.name}${tokenDetails?.ticker ? ` (${tokenDetails.ticker})` : ''}`;
      },
    }),
    transactionColumnHelper.accessor('asset', {
      header: 'Asset ID',
      cell: (info) => <AssetIdCell assetId={info.getValue()} />,
    }),
    transactionColumnHelper.accessor('amount', {
      header: 'Amount',
      cell: (info) => info.getValue(),
    }),
  ],
  [EActivityTableTabs.NFT_ACTIVITY]: [
    nftTransactionColumnHelper.accessor('txId', {
      header: 'Instruction Id',
      enableSorting: false,
      cell: (info) => {
        const data = info.getValue();
        const link = createTokenActivityLink(data as IIdData);
        return <IdCell link={link} label={data?.instructionId || '-'} />;
      },
    }),
    nftTransactionColumnHelper.accessor('dateTime', {
      header: 'Date / Time',
      cell: (info) => <DateCell data={info.getValue()} />,
    }),
    nftTransactionColumnHelper.accessor('from', {
      header: 'From',
      cell: (info) => <AddressCell address={info.getValue()} />,
    }),
    nftTransactionColumnHelper.accessor('to', {
      header: 'To',
      cell: (info) => <AddressCell address={info.getValue()} />,
    }),
    nftTransactionColumnHelper.accessor('nameAndTicker', {
      header: 'Name',
      enableSorting: false,
      cell: (info) => {
        const tokenDetails = info.getValue();
        return `${tokenDetails?.name}${tokenDetails?.ticker ? ` (${tokenDetails.ticker})` : ''}`;
      },
    }),
    nftTransactionColumnHelper.accessor('assetId', {
      header: 'Collection',
      cell: (info) => <AssetIdCell assetId={info.getValue()} isNftCollection />,
    }),
    nftTransactionColumnHelper.accessor('nftIds', {
      header: 'Token IDs',
      cell: (info) => {
        const { assetId } = info.row.original;
        return <NftIdsCell info={info} assetId={assetId} />;
      },
    }),
  ],
};
