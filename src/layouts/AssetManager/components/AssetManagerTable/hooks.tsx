import { useState, useEffect, useContext, useMemo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table';
import { AccountContext } from '~/context/AccountContext';
import { AssetManagerTableItem, EAssetManagerTableTabs } from './constants';
import { columns } from './config';
import { notifyError } from '~/helpers/notifications';
import { AssetContext } from '~/context/AssetContext';

const initialPaginationState = { pageIndex: 0, pageSize: 10 };

export const useAssetManagerTable = (currentTab: EAssetManagerTableTabs) => {
  const { ownedAssets, managedAssets, assetsLoading, tickerReservations } =
    useContext(AssetContext);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>(
    initialPaginationState,
  );
  const [tableDataLoading, setTableDataLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableData, setTableData] = useState<AssetManagerTableItem[]>([]);
  const { identity } = useContext(AccountContext);
  const tabRef = useRef<EAssetManagerTableTabs>(
    EAssetManagerTableTabs.OWNED_ASSETS,
  );
  const identityRef = useRef<string | null>(null);

  // Reset page index when tabs are switched
  useEffect(() => {
    if (
      currentTab !== tabRef.current ||
      identity?.did !== identityRef.current
    ) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [currentTab, pageSize, identity]);

  // Fetch Asset Manager table data for owned assets or ticker reservations
  useEffect(() => {
    if (assetsLoading || !identity) {
      return;
    }

    if (currentTab !== tabRef.current && pageIndex !== 0) return;
    setTableDataLoading(true);

    (async () => {
      try {
        switch (currentTab) {
          case EAssetManagerTableTabs.OWNED_ASSETS: {
            setTableData(ownedAssets);
            setTotalPages(Math.ceil(ownedAssets.length / pageSize));
            setTotalItems(ownedAssets.length);
            break;
          }
          case EAssetManagerTableTabs.MANAGED_ASSETS: {
            setTableData(managedAssets);
            setTotalPages(Math.ceil(managedAssets.length / pageSize));
            setTotalItems(managedAssets.length);
            break;
          }
          case EAssetManagerTableTabs.TICKER_RESERVATIONS: {
            setTableData(tickerReservations);
            setTotalPages(Math.ceil(tickerReservations.length / pageSize));
            setTotalItems(tickerReservations.length);
            break;
          }
          default:
            break;
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        tabRef.current = currentTab;
        identityRef.current = identity.did;
        setTableDataLoading(false);
      }
    })();
  }, [
    assetsLoading,
    currentTab,
    identity,
    ownedAssets,
    managedAssets,
    pageIndex,
    pageSize,
    tickerReservations,
  ]);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  return {
    table: useReactTable<AssetManagerTableItem>({
      data: tableData,
      columns: columns[tabRef.current] as ColumnDef<AssetManagerTableItem>[],
      state: { pagination },
      manualPagination:
        tabRef.current === EAssetManagerTableTabs.TICKER_RESERVATIONS,
      pageCount:
        tabRef.current === EAssetManagerTableTabs.TICKER_RESERVATIONS
          ? totalPages
          : Math.ceil(tableData.length ? tableData.length / pageSize : 1),
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
    }),
    tableDataLoading: tableDataLoading || assetsLoading,
    totalItems,
  };
};
