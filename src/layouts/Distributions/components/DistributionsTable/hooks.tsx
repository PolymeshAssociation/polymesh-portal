import { useState, useMemo, useContext, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table';
import { AccountContext } from '~/context/AccountContext';
import { IHistoricalDistribution } from './constants';
import { columns } from './config';
import { parseHistoricalDistributions } from './helpers';
import { gqlClient } from '~/config/graphql';
import { historicalDistributionsQuery } from '~/helpers/graphqlQueries';
import { notifyError } from '~/helpers/notifications';
import { ITransferQueryResponse } from '~/constants/queries/types';

export const useDistributionsTable = () => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableData, setTableData] = useState<IHistoricalDistribution[]>([]);
  const { identity, identityLoading } = useContext(AccountContext);

  const [tableLoading, setTableLoading] = useState(false);
  const identityRef = useRef<string | undefined>('');

  // Reset page index when identity changes
  useEffect(() => {
    if (identity?.did !== identityRef.current) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [identity]);

  useEffect(() => {
    if (!identity) {
      setTableData([]);
      identityRef.current = undefined;
      return;
    }

    setTableLoading(true);

    (async () => {
      try {
        const { data } = await gqlClient.query<ITransferQueryResponse>({
          query: historicalDistributionsQuery({
            did: identity.did,
            offset: pageIndex * pageSize,
            pageSize,
          }),
        });
        const parsedData = parseHistoricalDistributions(data.events.nodes);

        setTableData(parsedData);
        setTotalItems(data.events.totalCount);
        setTotalPages(Math.ceil(data.events.totalCount / pageSize));
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        identityRef.current = identity.did;
        setTableLoading(false);
      }
    })();
  }, [identity, pageIndex, pageSize]);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  return {
    table: useReactTable<IHistoricalDistribution>({
      data: tableData,
      columns: columns as ColumnDef<IHistoricalDistribution>[],
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
      identityLoading || tableLoading || identity?.did !== identityRef.current,
    totalItems,
  };
};
