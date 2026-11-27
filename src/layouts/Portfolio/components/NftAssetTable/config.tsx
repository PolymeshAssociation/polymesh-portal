import { createColumnHelper } from '@tanstack/react-table';
import { INftTransactionItem } from '~/layouts/Overview/components/ActivityTable/constants';
import { AssetIdCell } from '../../../../components/AssetIdCell';
import { IIdData } from '../AssetTable/constants';
import { createTokenActivityLink } from '../AssetTable/helpers';
import { AddressCell } from './components/AddressCell';
import { CollectionFilter } from './components/CollectionFilter';
import { DateCell } from './components/DateCell';
import { IdCell } from './components/IdCell';
import { TruncatedTextCell } from './components/TruncatedTextCell';
import {
  formatNameAndTicker,
  MEMO_MAX_WIDTH,
  NAME_MAX_WIDTH,
} from './components/TruncatedTextCell/constants';
import { MovementPartyCell } from './components/MovementPartyCell';
import { NftIdsCell } from './components/NftIdsCell';
import { TickerCell } from './components/TickerCell';
import {
  ENftAssetsTableTabs,
  ICollectionItem,
  INftAssetItem,
  INftMovementItem,
} from './constants';

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
      cell: (info) => <AssetIdCell assetId={info.getValue()} isNftCollection />,
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
      cell: (info) => <AssetIdCell assetId={info.getValue()} isNftCollection />,
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
      cell: (info) => <DateCell data={info.getValue()} compact />,
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
      cell: (info) => (
        <TruncatedTextCell
          text={formatNameAndTicker(info.getValue())}
          maxWidth={NAME_MAX_WIDTH}
        />
      ),
    }),

    transactionColumnHelper.accessor('assetId', {
      header: 'Asset ID',
      cell: (info) => <AssetIdCell assetId={info.getValue()} isNftCollection />,
    }),
    transactionColumnHelper.accessor('nftIds', {
      header: 'Token IDs',
      cell: (info) => {
        const { assetId } = info.row.original;
        return <NftIdsCell info={info} assetId={assetId} />;
      },
    }),
    transactionColumnHelper.accessor('memo', {
      header: 'Memo',
      enableSorting: false,
      cell: (info) => (
        <TruncatedTextCell
          text={info.getValue()}
          maxWidth={MEMO_MAX_WIDTH}
          keepCase
        />
      ),
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
      cell: (info) => <DateCell data={info.getValue()} compact />,
    }),
    movementColumnHelper.accessor('from', {
      header: 'From',
      cell: (info) => <MovementPartyCell party={info.getValue()} />,
    }),
    movementColumnHelper.accessor('to', {
      header: 'To',
      cell: (info) => <MovementPartyCell party={info.getValue()} />,
    }),
    movementColumnHelper.accessor('nameAndTicker', {
      header: 'Name',
      enableSorting: false,
      cell: (info) => (
        <TruncatedTextCell
          text={formatNameAndTicker(info.getValue())}
          maxWidth={NAME_MAX_WIDTH}
        />
      ),
    }),
    movementColumnHelper.accessor('collection', {
      header: 'Asset ID',
      cell: (info) => <AssetIdCell assetId={info.getValue()} isNftCollection />,
    }),
    movementColumnHelper.accessor('nftIds', {
      header: 'Token IDs',
      cell: (info) => {
        const assetId = info.row.original.collection;
        return <NftIdsCell info={info} assetId={assetId} />;
      },
    }),
    movementColumnHelper.accessor('memo', {
      header: 'Memo',
      enableSorting: false,
      cell: (info) => (
        <TruncatedTextCell
          text={info.getValue()}
          maxWidth={MEMO_MAX_WIDTH}
          keepCase
        />
      ),
    }),
  ],
};
