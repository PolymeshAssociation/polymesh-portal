import { useState, useMemo, useContext, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table';
import { AccountContext } from '~/context/AccountContext';
import { useHistoricData } from '~/hooks/polymesh';
import { EActivityTableTabs, IHistoricalItem, ITokenItem } from './constants';
import { columns } from './config';
import { parseExtrinsicHistory, parseTokenActivity } from './helpers';
import { transferEventsQuery } from '~/helpers/graphqlQueries';
import { notifyError } from '~/helpers/notifications';
import { ITransferQueryResponse } from '~/constants/queries/types';
import { PolymeshContext } from '~/context/PolymeshContext';

export const useActivityTable = (currentTab: `${EActivityTableTabs}`) => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableData, setTableData] = useState<(IHistoricalItem | ITokenItem)[]>(
    [],
  );
  const {
    settings: { gqlClient },
  } = useContext(PolymeshContext);
  const { identity, identityLoading } = useContext(AccountContext);
  const { extrinsicHistory, dataLoading, extrinsicCount, fetchedPageIndex } =
    useHistoricData({
      pageIndex,
      pageSize,
    });

  const [tableLoading, setTableLoading] = useState(false);
  const tabRef = useRef<string>('');
  const identityRef = useRef<string | undefined>('');

  // Reset page index when tabs are switched
  useEffect(() => {
    if (currentTab !== tabRef.current) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [currentTab]);

  // Reset page index when identity changes
  useEffect(() => {
    if (identity?.did !== identityRef.current) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [identity]);

  // Update table data for Historical Activity tab
  useEffect(() => {
    if (currentTab !== EActivityTableTabs.HISTORICAL_ACTIVITY || !gqlClient) {
      return;
    }
    setTableLoading(true);

    if (
      pageIndex !== fetchedPageIndex ||
      dataLoading ||
      (currentTab !== tabRef.current && pageIndex !== 0)
    ) {
      return;
    }

    (async () => {
      try {
        const parsedData = await parseExtrinsicHistory(
          extrinsicHistory,
          gqlClient,
        );
        setTableData(parsedData);
        setTotalItems(extrinsicCount);
        setTotalPages(Math.ceil(extrinsicCount / pageSize));
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setTableLoading(false);
        tabRef.current = currentTab;
        identityRef.current = identity?.did;
      }
    })();
  }, [
    currentTab,
    dataLoading,
    extrinsicCount,
    extrinsicHistory,
    fetchedPageIndex,
    gqlClient,
    identity?.did,
    pageIndex,
    pageSize,
  ]);

  // Update table data for Token Activity tab
  useEffect(() => {
    if (
      currentTab !== EActivityTableTabs.TOKEN_ACTIVITY ||
      (currentTab !== tabRef.current && pageIndex !== 0) ||
      !gqlClient
    ) {
      return;
    }
    if (!identity) {
      setTableData([]);
      tabRef.current = currentTab;
      identityRef.current = undefined;
      return;
    }

    setTableLoading(true);

    (async () => {
      try {
        const { data } = await gqlClient.query<ITransferQueryResponse>({
          query: transferEventsQuery({
            identityId: identity.did,
            portfolioId: null,
            offset: pageIndex * pageSize,
            pageSize,
          }),
        });
        const parsedData = parseTokenActivity(data.events.nodes);

        setTableData(parsedData);
        setTotalItems(data.events.totalCount);
        setTotalPages(Math.ceil(data.events.totalCount / pageSize));
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        tabRef.current = currentTab;
        identityRef.current = identity.did;
        setTableLoading(false);
      }
    })();
  }, [currentTab, gqlClient, identity, pageIndex, pageSize]);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  return {
    table: useReactTable<IHistoricalItem | ITokenItem>({
      data: tableData,
      columns: columns[currentTab] as ColumnDef<IHistoricalItem | ITokenItem>[],
      state: { pagination },
      manualPagination: true,
      pageCount: totalPages,
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      enableSorting: false,
    }),
    paginationState: pagination,
    tableLoading:
      identityLoading ||
      tableLoading ||
      currentTab !== tabRef.current ||
      identity?.did !== identityRef.current,
    totalItems,
  };
};
