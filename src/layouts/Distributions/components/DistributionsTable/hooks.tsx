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
import { historicalDistributionsQuery } from '~/helpers/graphqlQueries';
import { notifyError } from '~/helpers/notifications';
import { IDistributionsQueryResponse } from '~/constants/queries/types';
import { PolymeshContext } from '~/context/PolymeshContext';

export const useDistributionsTable = () => {
  const {
    api: { gqlClient },
    state: { middlewareMetadata },
  } = useContext(PolymeshContext);
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
    if (!identity || !gqlClient || !middlewareMetadata) {
      setTableData([]);
      identityRef.current = undefined;
      return;
    }

    setTableLoading(true);

    (async () => {
      try {
        const { data } = await gqlClient.query<IDistributionsQueryResponse>({
          query: historicalDistributionsQuery({
            did: identity.did,
            offset: pageIndex * pageSize,
            pageSize,
            paddedIds: middlewareMetadata.paddedIds,
          }),
        });
        const parsedData = parseHistoricalDistributions(
          data.distributionPayments.nodes,
        );

        setTableData(parsedData);
        setTotalItems(data.distributionPayments.totalCount);
        setTotalPages(
          Math.ceil(data.distributionPayments.totalCount / pageSize),
        );
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        identityRef.current = identity.did;
        setTableLoading(false);
      }
    })();
  }, [identity, pageIndex, pageSize, gqlClient, middlewareMetadata]);

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
