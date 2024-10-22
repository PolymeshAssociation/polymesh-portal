import { createColumnHelper } from '@tanstack/react-table';
import { IIdData } from '../AssetTable/constants';
import { createTokenActivityLink } from '../AssetTable/helpers';
import { CollectionFilter } from './components/CollectionFilter';
import { TickerCell } from './components/TickerCell';
import { IdCell } from './components/IdCell';
import { DateCell } from './components/DateCell';
import { NftIdsCell } from './components/NftIdsCell';
import { AddressCell } from './components/AddressCell';
import {
  ENftAssetsTableTabs,
  ICollectionItem,
  INftAssetItem,
  INftMovementItem,
} from './constants';
import { AssetIdCell } from './components/AssetIdCell';
import { INftTransactionItem } from '~/layouts/Overview/components/ActivityTable/constants';

const collectionColumnHelper = createColumnHelper<ICollectionItem>();
const allNftsColumnHelper = createColumnHelper<INftAssetItem>();
const movementColumnHelper = createColumnHelper<INftMovementItem>();
const transactionColumnHelper = createColumnHelper<INftTransactionItem>();

export const columns = {
  [ENftAssetsTableTabs.COLLECTIONS]: [
    collectionColumnHelper.accessor('ticker', {
      header: (info) => <CollectionFilter info={info} name="Collection Name" />,
      cell: (info) => <TickerCell info={info.getValue()} />,
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const tickerA = rowA.original.ticker.name as string;
        const tickerB = rowB.original.ticker.name as string;
        return tickerA.localeCompare(tickerB);
      },
    }),
    collectionColumnHelper.accessor('collectionAssetId', {
      header: 'Collection Asset ID',
      cell: (info) => (
        <AssetIdCell assetId={info.getValue()} abbreviate={false} />
      ),
    }),
    collectionColumnHelper.accessor('collectionId', {
      header: 'Collection ID',
      cell: (info) => info.getValue(),
    }),
    collectionColumnHelper.accessor('assetType', {
      header: 'Asset Type',
      cell: (info) => info.getValue(),
    }),
    collectionColumnHelper.accessor('count', {
      header: 'Count',
      cell: (info) => info.getValue(),
    }),
  ],
  [ENftAssetsTableTabs.ALL_NFTS]: [
    allNftsColumnHelper.accessor('ticker', {
      header: (info) => <CollectionFilter info={info} name="Collection Name" />,
      cell: (info) => <TickerCell info={info.getValue()} />,
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const tickerA = rowA.original.ticker.name as string;
        const tickerB = rowB.original.ticker.name as string;
        return tickerA.localeCompare(tickerB);
      },
    }),
    allNftsColumnHelper.accessor('collectionAssetId', {
      header: 'Collection Asset ID',
      cell: (info) => (
        <AssetIdCell assetId={info.getValue()} abbreviate={false} />
      ),
    }),
    allNftsColumnHelper.accessor('collectionId', {
      header: 'Collection ID',
      cell: (info) => info.getValue(),
    }),
    allNftsColumnHelper.accessor('nftId', {
      header: 'NFT ID',
      cell: (info) => info.getValue(),
    }),
    allNftsColumnHelper.accessor('assetType', {
      header: 'Asset Type',
      cell: (info) => info.getValue(),
    }),
    allNftsColumnHelper.accessor('isLocked', {
      header: 'Status',
      cell: (info) => {
        const data = info.getValue();
        return data ? 'Locked' : 'Free';
      },
    }),
  ],
  [ENftAssetsTableTabs.TRANSACTIONS]: [
    transactionColumnHelper.accessor('txId', {
      header: 'Instruction ID',
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
    transactionColumnHelper.accessor('nameAndTicker', {
      header: 'Name',
      enableSorting: false,
      cell: (info) => {
        const tokenDetails = info.getValue();
        return `${tokenDetails?.name}${tokenDetails?.ticker ? ` (${tokenDetails.ticker})` : ''}`;
      },
    }),

    transactionColumnHelper.accessor('assetId', {
      header: 'Asset ID',
      cell: (info) => <AssetIdCell assetId={info.getValue()} />,
    }),
    transactionColumnHelper.accessor('nftIds', {
      header: 'Token IDs',
      cell: (info) => <NftIdsCell info={info} />,
    }),
  ],
  [ENftAssetsTableTabs.MOVEMENTS]: [
    movementColumnHelper.accessor('movementId', {
      header: 'Id',
      enableSorting: false,
      cell: (info) => {
        const data = info.getValue();
        const link = `${import.meta.env.VITE_SUBSCAN_URL}extrinsic/${data}`;
        return <IdCell link={link} label={data} />;
      },
    }),
    movementColumnHelper.accessor('dateTime', {
      header: 'Date / Time',
      cell: (info) => <DateCell data={info.getValue()} />,
    }),
    movementColumnHelper.accessor('from', {
      header: 'From',
      cell: (info) => info.getValue(),
    }),
    movementColumnHelper.accessor('to', {
      header: 'To',
      cell: (info) => info.getValue(),
    }),
    movementColumnHelper.accessor('nameAndTicker', {
      header: 'Name',
      enableSorting: false,
      cell: (info) => {
        const tokenDetails = info.getValue();
        return `${tokenDetails?.name}${tokenDetails?.ticker ? ` (${tokenDetails.ticker})` : ''}`;
      },
    }),
    movementColumnHelper.accessor('collection', {
      header: 'Asset ID',
      cell: (info) => <AssetIdCell assetId={info.getValue()} />,
    }),
    movementColumnHelper.accessor('nftIds', {
      header: 'Token IDs',
      cell: (info) => <NftIdsCell info={info} />,
    }),
  ],
};
