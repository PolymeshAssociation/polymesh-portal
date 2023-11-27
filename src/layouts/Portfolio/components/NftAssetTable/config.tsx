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
  INftTransactionItem,
} from './constants';

const collectionColumnHelper = createColumnHelper<ICollectionItem>();
const allNftsColumnHelper = createColumnHelper<INftAssetItem>();
const movementColumnHelper = createColumnHelper<INftMovementItem>();
const transactionColumnHelper = createColumnHelper<INftTransactionItem>();

export const columns = {
  [ENftAssetsTableTabs.COLLECTIONS]: [
    collectionColumnHelper.accessor('ticker', {
      header: (info) => <CollectionFilter info={info} name="Ticker" />,
      cell: (info) => <TickerCell info={info.getValue()} />,
      enableSorting: true,
    }),
    collectionColumnHelper.accessor('name', {
      header: 'Name',
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
      header: 'Nft Image',
      cell: (info) => <TickerCell info={info.getValue()} />,
      enableSorting: true,
    }),
    allNftsColumnHelper.accessor('id', {
      header: 'Nft ID',
      cell: (info) => info.getValue(),
    }),
    allNftsColumnHelper.accessor('collectionTicker', {
      header: (info) => (
        <CollectionFilter info={info} name="Collection Ticker" />
      ),
      cell: (info) => info.getValue(),
    }),
    allNftsColumnHelper.accessor('collectionName', {
      header: 'Collection Name',
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
      header: 'Id',
      enableSorting: false,
      cell: (info) => {
        const data = info.getValue();
        const link = createTokenActivityLink(data as IIdData);
        return <IdCell link={link} label={data?.eventId} />;
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
      header: 'Count / IDs',
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
    movementColumnHelper.accessor('collection', {
      header: 'Collection',
      cell: (info) => info.getValue(),
    }),
    movementColumnHelper.accessor('nftIds', {
      header: 'Count / IDs',
      cell: (info) => <NftIdsCell info={info} />,
    }),
  ],
};
