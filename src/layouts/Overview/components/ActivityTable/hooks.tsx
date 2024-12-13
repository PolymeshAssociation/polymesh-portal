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
import {
  EActivityTableTabs,
  IHistoricalItem,
  ITransactionItem,
  INftTransactionItem,
} from './constants';
import { columns } from './config';
import { parseExtrinsicHistory, parseTokenActivity } from './helpers';
import { transferEventsQuery } from '~/helpers/graphqlQueries';
import { notifyError } from '~/helpers/notifications';
import { ITransactionsQueryResponse } from '~/constants/queries/types';
import { PolymeshContext } from '~/context/PolymeshContext';
import { parseNftTransactions } from '~/layouts/Portfolio/components/NftAssetTable/helpers';

export const useActivityTable = (currentTab: EActivityTableTabs) => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableData, setTableData] = useState<
    (IHistoricalItem | ITransactionItem | INftTransactionItem)[]
  >([]);
  const {
    api: { gqlClient },
    state: { middlewareMetadata },
  } = useContext(PolymeshContext);
  const { account, accountLoading, identity, identityLoading } =
    useContext(AccountContext);

  const [tableLoading, setTableLoading] = useState(false);
  const tabRef = useRef<EActivityTableTabs>(
    EActivityTableTabs.HISTORICAL_ACTIVITY,
  );
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
          orderBy: ExtrinsicsOrderBy.BlockIdDesc,
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
      currentTab === EActivityTableTabs.HISTORICAL_ACTIVITY ||
      (currentTab !== tabRef.current && pageIndex !== 0) ||
      (identity?.did !== identityRef.current && pageIndex !== 0) ||
      !gqlClient ||
      !middlewareMetadata
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
        const { data } = await gqlClient.query<ITransactionsQueryResponse>({
          query: transferEventsQuery({
            identityId: identity.did,
            portfolioId: null,
            offset: pageIndex * pageSize,
            pageSize,
            nonFungible: currentTab === EActivityTableTabs.NFT_ACTIVITY,
            paddedIds: middlewareMetadata.paddedIds,
          }),
        });

        const parsedData =
          currentTab === EActivityTableTabs.TOKEN_ACTIVITY
            ? parseTokenActivity(data.assetTransactions.nodes)
            : parseNftTransactions(data);

        setTableData(parsedData);
        setTotalItems(data.assetTransactions.totalCount);
        setTotalPages(Math.ceil(data.assetTransactions.totalCount / pageSize));
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        tabRef.current = currentTab;
        identityRef.current = identity.did;
        setTableLoading(false);
      }
    })();
  }, [
    currentTab,
    gqlClient,
    identity,
    identityLoading,
    middlewareMetadata,
    pageIndex,
    pageSize,
  ]);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  return {
    table: useReactTable<
      IHistoricalItem | ITransactionItem | INftTransactionItem
    >({
      data: tableData,
      columns: columns[currentTab] as ColumnDef<
        IHistoricalItem | ITransactionItem | INftTransactionItem
      >[],
      state: { pagination },
      manualPagination: true,
      pageCount: totalPages,
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      enableSorting: false,
    }),
    paginationState: pagination,
    tableLoading: tableLoading || currentTab !== tabRef.current,
    totalItems,
  };
};
