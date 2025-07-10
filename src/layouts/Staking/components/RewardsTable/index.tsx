import { useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table } from '~/components';
import { AccountContext } from '~/context/AccountContext';
import { ERewardTableTabs, maxQuerySize } from './constants';
import { useRewardTable } from './hooks';

export const RewardsTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { identity } = useContext(AccountContext);

  // Set tab provided in URL search parameters or default to account
  const initialTab = useMemo(() => {
    const tabSearchParam =
      (searchParams.get('tab') as ERewardTableTabs) || null;

    if (
      !tabSearchParam ||
      (tabSearchParam &&
        !Object.values(ERewardTableTabs).includes(tabSearchParam))
    ) {
      return ERewardTableTabs.ACCOUNT_REWARDS;
    }

    return tabSearchParam;
  }, [searchParams]);

  const [tab, setTab] = useState<ERewardTableTabs>(initialTab);

  // Set initial page index if provided in URL search parameters
  const initialPage = useMemo(() => {
    const pageIndexSearchParam = searchParams.get('pageIndex');

    if (!pageIndexSearchParam) {
      return undefined;
    }
    const pageIndexAsNumber = parseInt(pageIndexSearchParam, 10);

    if (!Number.isNaN(pageIndexAsNumber) && pageIndexAsNumber >= 0) {
      return pageIndexAsNumber;
    }
    return undefined;
  }, [searchParams]);

  // Set initial page size if provided in URL search parameters
  const initialPageSize = useMemo(() => {
    const pageSizeSearchParam = searchParams.get('pageSize');
    if (!pageSizeSearchParam) {
      return undefined;
    }
    const pageSizeAsNumber = parseInt(pageSizeSearchParam, 10);

    if (
      !Number.isNaN(pageSizeAsNumber) &&
      pageSizeAsNumber > 0 &&
      pageSizeAsNumber <= maxQuerySize
    ) {
      return pageSizeAsNumber;
    }
    return undefined;
  }, [searchParams]);

  const {
    table,
    tableLoading,
    totalItems,
    downloadAllPages,
    downloadDisabled,
  } = useRewardTable(tab, initialPage, initialPageSize);

  const tableState = table.getState();
  const {
    pagination: { pageIndex, pageSize },
  } = tableState;

  useEffect(() => {
    if (!tab) return;

    setSearchParams({
      tab,
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
    });
  }, [setSearchParams, tab, pageIndex, pageSize]);

  return (
    tab && (
      <Table
        data={{ table, tab }}
        tabs={
          identity
            ? Object.values(ERewardTableTabs)
            : [ERewardTableTabs.ACCOUNT_REWARDS]
        }
        setTab={setTab}
        title="Staking Rewards"
        loading={tableLoading}
        totalItems={totalItems}
        downloadButton={{
          buttonText: 'Download Reward Data',
          handleDownloadClick: downloadAllPages,
          disabled: downloadDisabled,
        }}
      />
    )
  );
};
