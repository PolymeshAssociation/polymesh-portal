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
import { gqlClient } from '~/config/graphql';
import { transferEventsQuery } from '~/helpers/graphqlQueries';
import { notifyError } from '~/helpers/notifications';
import { ITransferQueryResponse } from '~/constants/queries/types';

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
  const { identity, identityLoading } = useContext(AccountContext);
  const { extrinsicHistory, dataLoading, extrinsicCount } = useHistoricData({
    pageIndex,
    pageSize,
  });

  const [tableLoading, setTableLoading] = useState(false);
  const tabRef = useRef<string>('');
  const identityRef = useRef<string>('');

  // Reset page index when tabs are switched or identity changes
  useEffect(() => {
    if (dataLoading || tableLoading || !identity) return;

    if (currentTab !== tabRef.current || identity.did !== identityRef.current) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [currentTab, pageSize, dataLoading, tableLoading, identity]);

  useEffect(() => {
    if (!identity) {
      return;
    }

    if (currentTab === EActivityTableTabs.HISTORICAL_ACTIVITY && dataLoading) {
      setTableLoading(true);
      return;
    }

    if (currentTab !== tabRef.current && pageIndex !== 0) return;

    (async () => {
      try {
        setTableLoading(true);
        setTableData([]);
        switch (currentTab) {
          case EActivityTableTabs.HISTORICAL_ACTIVITY: {
            const parsedData = await parseExtrinsicHistory(extrinsicHistory);

            setTableData(parsedData);
            setTotalItems(extrinsicCount);
            setTotalPages(Math.ceil(extrinsicCount / pageSize));

            break;
          }

          case EActivityTableTabs.TOKEN_ACTIVITY: {
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
        setTableLoading(false);
      }
    })();
  }, [
    identity,
    dataLoading,
    extrinsicHistory,
    currentTab,
    pageIndex,
    pageSize,
    extrinsicCount,
  ]);

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
    tableLoading: identityLoading || dataLoading || tableLoading,
    totalItems,
  };
};
