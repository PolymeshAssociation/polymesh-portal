import {
  useState,
  useMemo,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table';
import { Account, MultiSig } from '@polymeshassociation/polymesh-sdk/internal';
import type { ApolloQueryResult } from '@apollo/client';
import type { Subscription } from 'zen-observable-ts';
import { AccountContext } from '~/context/AccountContext';

import {
  ERewardTableTabs,
  IAccountRewardItem,
  IIdentityRewardItem,
} from './constants';
import { columns } from './config';
import { parseIdentityRewards, parseAccountRewards } from './helpers';
import { StakingRewardsQuery } from '~/helpers/graphqlQueries';
import { notifyError } from '~/helpers/notifications';
import { IRewardsQueryResponse } from '~/constants/queries/types';
import { PolymeshContext } from '~/context/PolymeshContext';
import { downloadCSV } from '~/helpers/utils';

export const useRewardTable = (
  currentTab: ERewardTableTabs,
  index = 0,
  size = 10,
) => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: index,
    pageSize: size,
  });
  const [totalPages, setTotalPages] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableData, setTableData] = useState<
    (IAccountRewardItem | IIdentityRewardItem)[]
  >([]);
  const {
    api: { gqlClient },
    state: { middlewareMetadata },
  } = useContext(PolymeshContext);
  const { account, accountLoading, identity, identityLoading } =
    useContext(AccountContext);

  const [tableLoading, setTableLoading] = useState(true);
  const [downloadDisabled, setDownloadDisabled] = useState(false);
  const tabRef = useRef<ERewardTableTabs | ''>('');
  const identityRef = useRef<string | undefined>(undefined);
  const accountRef = useRef<Account | MultiSig | null>(null);

  // Reset page index when tabs are switched
  useEffect(() => {
    if (tabRef.current && currentTab !== tabRef.current) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [currentTab]);

  // Reset page index when identity changes
  useEffect(() => {
    if (
      identity &&
      identityRef.current &&
      identity.did !== identityRef.current
    ) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [identity]);

  // Reset page index when account changes
  useEffect(() => {
    if (accountRef.current && account !== accountRef.current) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [account]);

  // Update table data for Identity Rewards tab
  useEffect(() => {
    if (
      currentTab !== ERewardTableTabs.IDENTITY_REWARDS ||
      (tabRef.current && currentTab !== tabRef.current && pageIndex !== 0) ||
      !gqlClient ||
      !middlewareMetadata
    ) {
      return undefined;
    }
    setTableLoading(true);

    if (identityLoading) {
      return undefined;
    }

    if (!identity) {
      setTableData([]);
      tabRef.current = currentTab;
      identityRef.current = undefined;
      setTableLoading(false);
      return undefined;
    }

    let querySubscription: Subscription;

    (async () => {
      try {
        querySubscription = gqlClient
          .watchQuery({
            query: StakingRewardsQuery({
              offset: pageIndex * pageSize,
              pageSize,
              identityId: identity?.did,
              paddedIds: middlewareMetadata.paddedIds,
            }),
            fetchPolicy: 'cache-and-network',
          })
          .subscribe(
            ({ data, error }: ApolloQueryResult<IRewardsQueryResponse>) => {
              setTableLoading(false);
              if (error) {
                notifyError(error.message);
                return;
              }
              const parsedData = parseIdentityRewards(data.stakingEvents.nodes);

              setTableData(parsedData);
              setTotalItems(data.stakingEvents.totalCount);
              setTotalPages(
                Math.ceil(data.stakingEvents.totalCount / pageSize),
              );
            },
          );
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        tabRef.current = currentTab;
        identityRef.current = identity.did;
      }
    })();
    return () => {
      if (querySubscription) {
        querySubscription.unsubscribe();
      }
    };
  }, [
    currentTab,
    gqlClient,
    identity,
    identityLoading,
    middlewareMetadata,
    pageIndex,
    pageSize,
  ]);

  // Update table data for Account Rewards tab
  useEffect(() => {
    if (
      currentTab !== ERewardTableTabs.ACCOUNT_REWARDS ||
      (tabRef.current && currentTab !== tabRef.current && pageIndex !== 0) ||
      !gqlClient ||
      !middlewareMetadata
    ) {
      return undefined;
    }

    setTableLoading(true);
    if (accountLoading) {
      return undefined;
    }

    if (!account) {
      setTableData([]);
      tabRef.current = currentTab;
      accountRef.current = null;
      setTableLoading(false);

      return undefined;
    }

    let querySubscription: Subscription;

    (async () => {
      try {
        querySubscription = gqlClient
          .watchQuery({
            query: StakingRewardsQuery({
              offset: pageIndex * pageSize,
              pageSize,
              accountRawKey: account.address,
              paddedIds: middlewareMetadata.paddedIds,
            }),
            fetchPolicy: 'cache-and-network',
          })
          .subscribe(
            ({ data, error }: ApolloQueryResult<IRewardsQueryResponse>) => {
              setTableLoading(false);
              if (error) {
                notifyError(error.message);
                return;
              }
              const parsedData = parseAccountRewards(data.stakingEvents.nodes);

              setTableData(parsedData);
              setTotalItems(data.stakingEvents.totalCount);
              setTotalPages(
                Math.ceil(data.stakingEvents.totalCount / pageSize),
              );
            },
          );
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        tabRef.current = currentTab;
        accountRef.current = account;
      }
    })();
    return () => {
      if (querySubscription) {
        querySubscription.unsubscribe();
      }
    };
  }, [
    account,
    accountLoading,
    currentTab,
    gqlClient,
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

  const downloadAllPages = useCallback(async () => {
    if (!gqlClient) {
      throw new Error('gqlClient is not provided');
    }

    if (!middlewareMetadata) {
      throw new Error('middlewareMetadata is not provided');
    }

    setDownloadDisabled(true);
    try {
      const batchSize = 100;
      const pageCount = Math.ceil(totalItems / batchSize);
      const promises: Promise<(IAccountRewardItem | IIdentityRewardItem)[]>[] =
        [];
      let queryOptions: {
        offset: number;
        pageSize: number;
        identityId?: string;
        accountRawKey?: string;
      };
      const headings = ['Event ID', 'Block ID', 'Date Time', 'Stash', 'amount'];
      if (currentTab === ERewardTableTabs.IDENTITY_REWARDS) {
        queryOptions = {
          offset: 0,
          pageSize: 0,
          identityId: identity?.did,
        };
      } else if (currentTab === ERewardTableTabs.ACCOUNT_REWARDS) {
        queryOptions = {
          offset: 0,
          pageSize: 0,
          accountRawKey: account?.address,
        };
      } else {
        throw new Error('unknown currentTab value');
      }

      const maxPagesPerSecond = 6;
      const delay = 1000 / maxPagesPerSecond; // Delay in milliseconds between queries

      for (let page = 0; page < pageCount; page += 1) {
        const queryOpts = {
          ...queryOptions,
          offset: page * batchSize,
          pageSize: batchSize,
          paddedIds: middlewareMetadata.paddedIds,
        };

        promises.push(
          (async () => {
            await new Promise((resolve) => {
              setTimeout(resolve, page < maxPagesPerSecond ? 0 : page * delay);
            });

            return gqlClient
              .query<IRewardsQueryResponse>({
                query: StakingRewardsQuery(queryOpts),
              })
              .then(({ data }) =>
                parseIdentityRewards(data.stakingEvents.nodes),
              );
          })(),
        );
      }

      const allData = await Promise.all(promises);
      const parsedData = allData.flat();
      const extractedData = parsedData.map((item) => {
        const { id, ...rest } = item;
        return {
          eventId: id.eventId,
          blockId: id.blockId,
          ...rest,
        };
      });
      downloadCSV(extractedData, headings, 'rewardTableData.csv');
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setDownloadDisabled(false);
    }
  }, [
    account?.address,
    currentTab,
    gqlClient,
    identity?.did,
    middlewareMetadata,
    totalItems,
  ]);

  return {
    table: useReactTable<IAccountRewardItem | IIdentityRewardItem>({
      data: tableData,
      columns: columns[currentTab] as ColumnDef<
        IAccountRewardItem | IIdentityRewardItem
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
    tableLoading:
      tableLoading ||
      currentTab !== tabRef.current ||
      (currentTab === 'identity' && identity?.did !== identityRef.current) ||
      (currentTab === 'account' && account !== accountRef.current),
    totalItems,
    downloadAllPages,
    downloadDisabled,
  };
};
