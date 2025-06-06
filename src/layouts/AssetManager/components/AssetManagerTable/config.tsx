import { createColumnHelper } from '@tanstack/react-table';
import { SortHeader } from '~/components/Table/components/SortHeader';
import {
  EAssetManagerTableTabs,
  IOwnedAssetItem,
  IManagedAssetItem,
  ITickerReservationItem,
} from './constants';
import { AssetIdCell } from '../../../../components/AssetIdCell';

const ownedAssetColumnHelper = createColumnHelper<IOwnedAssetItem>();
const managedAssetColumnHelper = createColumnHelper<IManagedAssetItem>();
const tickerReservationColumnHelper =
  createColumnHelper<ITickerReservationItem>();

export const columns = {
  [EAssetManagerTableTabs.OWNED_ASSETS]: [
    ownedAssetColumnHelper.accessor('id', {
      header: (info) => <SortHeader header={info} label="Asset ID" />,
      enableSorting: true,
      sortingFn: (rowA, rowB) =>
        rowA.original.id
          .toLowerCase()
          .localeCompare(rowB.original.id.toLowerCase()),
      cell: (info) => (
        <AssetIdCell
          assetId={info.getValue()}
          abbreviate={false}
          disableNavigation
        />
      ),
    }),
    ownedAssetColumnHelper.accessor('name', {
      header: (info) => <SortHeader header={info} label="Name" />,
      enableSorting: true,
      cell: (info) => info.getValue(),
    }),
    ownedAssetColumnHelper.accessor('ticker', {
      header: (info) => <SortHeader header={info} label="Ticker" />,
      enableSorting: true,
      cell: (info) => info.getValue(),
    }),
    ownedAssetColumnHelper.accessor('nonFungible', {
      header: (info) => <SortHeader header={info} label="Asset Type" />,
      enableSorting: true,
      cell: (info) => {
        const nonFungible = info.getValue();
        return nonFungible ? 'NFT' : 'Fungible';
      },
    }),
  ],
  [EAssetManagerTableTabs.MANAGED_ASSETS]: [
    managedAssetColumnHelper.accessor('id', {
      header: (info) => <SortHeader header={info} label="Asset ID" />,
      enableSorting: true,
      sortingFn: (rowA, rowB) =>
        rowA.original.id
          .toLowerCase()
          .localeCompare(rowB.original.id.toLowerCase()),
      cell: (info) => (
        <AssetIdCell
          assetId={info.getValue()}
          abbreviate={false}
          disableNavigation
        />
      ),
    }),
    managedAssetColumnHelper.accessor('name', {
      header: (info) => <SortHeader header={info} label="Name" />,
      enableSorting: true,
      cell: (info) => info.getValue(),
    }),
    managedAssetColumnHelper.accessor('ticker', {
      header: (info) => <SortHeader header={info} label="Ticker" />,
      enableSorting: true,
      cell: (info) => info.getValue(),
    }),
    managedAssetColumnHelper.accessor('nonFungible', {
      header: (info) => <SortHeader header={info} label="Asset Type" />,
      enableSorting: true,
      cell: (info) => {
        const nonFungible = info.getValue();
        return nonFungible ? 'NFT' : 'Fungible';
      },
    }),
  ],
  [EAssetManagerTableTabs.TICKER_RESERVATIONS]: [
    tickerReservationColumnHelper.accessor('ticker', {
      header: (info) => <SortHeader header={info} label="Ticker" />,
      enableSorting: true,
      cell: (info) => info.getValue(),
    }),
    tickerReservationColumnHelper.accessor('expiryDate', {
      header: (info) => <SortHeader header={info} label="Expiry" />,
      enableSorting: true,
      cell: (info) => {
        const data = info.getValue();
        if (!data) return '';
        return data.toLocaleString();
      },
    }),
  ],
};
