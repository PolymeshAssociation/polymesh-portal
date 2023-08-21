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
  currentTab: `${ERewardTableTabs}`,
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
    ss58Prefix,
  } = useContext(PolymeshContext);
  const { account, accountLoading, identity, identityLoading } =
    useContext(AccountContext);

  const [tableLoading, setTableLoading] = useState(true);
  const [downloadDisabled, setDownloadDisabled] = useState(false);
  const tabRef = useRef<string>('');
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
      !ss58Prefix
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
        const { data } = await gqlClient.query<IRewardsQueryResponse>({
          query: StakingRewardsQuery({
            offset: pageIndex * pageSize,
            pageSize,
            identityId: identity?.did,
          }),
          // fetchPolicy: 'cache-first',
        });

        const parsedData = parseIdentityRewards(data.events.nodes, ss58Prefix);

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
  }, [
    currentTab,
    gqlClient,
    identity,
    identityLoading,
    pageIndex,
    pageSize,
    ss58Prefix,
  ]);

  // Update table data for Account Rewards tab
  useEffect(() => {
    if (
      currentTab !== ERewardTableTabs.ACCOUNT_REWARDS ||
      (tabRef.current && currentTab !== tabRef.current && pageIndex !== 0) ||
      !gqlClient
    ) {
      return;
    }

    setTableLoading(true);
    if (accountLoading) {
      return;
    }

    if (!account) {
      setTableData([]);
      tabRef.current = currentTab;
      accountRef.current = null;
      setTableLoading(false);

      return;
    }

    (async () => {
      try {
        const { data } = await gqlClient.query<IRewardsQueryResponse>({
          query: StakingRewardsQuery({
            offset: pageIndex * pageSize,
            pageSize,
            accountRawKey: account.key,
          }),
          // fetchPolicy: 'cache-first',
        });

        const parsedData = parseAccountRewards(data.events.nodes);

        setTableData(parsedData);
        setTotalItems(data.events.totalCount);
        setTotalPages(Math.ceil(data.events.totalCount / pageSize));
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        tabRef.current = currentTab;
        accountRef.current = account;
        setTableLoading(false);
      }
    })();
  }, [account, accountLoading, currentTab, gqlClient, pageIndex, pageSize]);

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

    if (!ss58Prefix) {
      throw new Error('ss58Prefix is not provided');
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
          accountRawKey: account?.key,
        };
      } else {
        throw new Error('unknown currentTab value');
      }

      for (let page = 0; page < pageCount; page += 1) {
        queryOptions.offset = page * batchSize;
        queryOptions.pageSize = batchSize;

        promises.push(
          gqlClient
            .query<IRewardsQueryResponse>({
              query: StakingRewardsQuery(queryOptions),
            })
            .then(({ data }) =>
              parseIdentityRewards(data.events.nodes, ss58Prefix),
            ),
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
    account?.key,
    currentTab,
    gqlClient,
    identity?.did,
    ss58Prefix,
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
