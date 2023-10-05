import { useState, useMemo, useContext, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table';
import { ExtrinsicsOrderBy } from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { AccountContext } from '~/context/AccountContext';
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
    api: { gqlClient },
  } = useContext(PolymeshContext);
  const { account, accountLoading, identity, identityLoading } =
    useContext(AccountContext);

  const [tableLoading, setTableLoading] = useState(false);
  const tabRef = useRef<string>('');
  const identityRef = useRef<string | undefined>('');
  const accountRef = useRef<string | undefined>('');

  // Reset page index when tabs are switched
  useEffect(() => {
    if (currentTab !== tabRef.current) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [currentTab]);

  // Reset page index when account changes
  useEffect(() => {
    if (
      account?.address !== accountRef.current &&
      currentTab === EActivityTableTabs.HISTORICAL_ACTIVITY
    ) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [account, currentTab]);

  // Reset page index when identity changes
  useEffect(() => {
    if (
      identity?.did !== identityRef.current &&
      currentTab === EActivityTableTabs.TOKEN_ACTIVITY
    ) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [currentTab, identity]);

  // Update table data for Historical Activity tab
  useEffect(() => {
    if (
      currentTab !== EActivityTableTabs.HISTORICAL_ACTIVITY ||
      (currentTab !== tabRef.current && pageIndex !== 0) ||
      (account?.address !== accountRef.current && pageIndex !== 0) ||
      !gqlClient ||
      accountLoading ||
      !account
    ) {
      return;
    }
    setTableLoading(true);

    (async () => {
      try {
        const { data, count } = await account.getTransactionHistory({
          orderBy: ExtrinsicsOrderBy.CreatedAtDesc,
          size: new BigNumber(pageSize),
          start: new BigNumber(pageIndex * pageSize),
        });
        const parsedData = await parseExtrinsicHistory(data);
        setTableData(parsedData);
        if (count) {
          const extrinsicCount = count.toNumber();
          setTotalItems(extrinsicCount);
          setTotalPages(Math.ceil(extrinsicCount / pageSize));
        } else {
          setTotalItems(0);
          setTotalPages(0);
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setTableLoading(false);
        tabRef.current = currentTab;
        accountRef.current = account.address;
      }
    })();
  }, [account, accountLoading, currentTab, gqlClient, pageIndex, pageSize]);

  // Update table data for Token Activity tab
  useEffect(() => {
    if (
      currentTab !== EActivityTableTabs.TOKEN_ACTIVITY ||
      (currentTab !== tabRef.current && pageIndex !== 0) ||
      (identity?.did !== identityRef.current && pageIndex !== 0) ||
      !gqlClient
    ) {
      return;
    }
    setTableLoading(true);

    if (identityLoading) {
      return;
    }
    if (!identity) {
      setTableData([]);
      tabRef.current = currentTab;
      identityRef.current = undefined;
      setTableLoading(false);
      return;
    }

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
  }, [currentTab, gqlClient, identity, identityLoading, pageIndex, pageSize]);

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
    tableLoading,
    totalItems,
  };
};
