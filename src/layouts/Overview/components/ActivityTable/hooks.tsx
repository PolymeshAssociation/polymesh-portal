import { useState, useMemo, useContext, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table';
import { useQuery } from '@apollo/client';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';
import { useHistoricData } from '~/hooks/polymesh';
import { getAssetTransferEvents } from '~/constants/queries';
import { EActivityTableTabs, IHistoricalItem, ITokenItem } from './constants';
import { columns } from './config';
import { parseExtrinsicHistory, parseTokenActivity } from './helpers';

export const useActivityTable = (currentTab: `${EActivityTableTabs}`) => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [tableData, setTableData] = useState<(IHistoricalItem | ITokenItem)[]>(
    [],
  );
  const {
    state: { connecting },
  } = useContext(PolymeshContext);
  const { selectedAccount, identity } = useContext(AccountContext);
  const { extrinsicHistory, dataLoading, extrinsicCount } = useHistoricData({
    pageIndex,
    pageSize,
  });
  const [dataParsing, setDataParsing] = useState(false);
  const { loading, error, data } = useQuery(getAssetTransferEvents, {
    variables: { did: identity?.did || '' },
  });
  const tabRef = useRef<string>('');

  // Reset page index when tabs are switched
  useEffect(() => {
    if (dataLoading || loading) return;

    if (currentTab !== tabRef.current) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [currentTab, pageSize, dataLoading, loading]);

  useEffect(() => {
    if (!identity || connecting || dataLoading || loading || error) {
      return setTableData([]);
    }

    switch (currentTab) {
      case EActivityTableTabs.HISTORICAL_ACTIVITY: {
        setDataParsing(true);
        (async () => {
          const parsedData = await parseExtrinsicHistory(extrinsicHistory);

          setTableData(parsedData);
          tabRef.current = currentTab;
          setDataParsing(false);
        })();
        break;
      }

      case EActivityTableTabs.TOKEN_ACTIVITY: {
        const parsedData = parseTokenActivity(data.events.nodes);

        setTableData(parsedData);
        tabRef.current = currentTab;
        break;
      }

      default:
        break;
    }

    return undefined;
  }, [
    identity,
    connecting,
    data,
    dataLoading,
    error,
    extrinsicHistory,
    loading,
    selectedAccount,
    setTableData,
    currentTab,
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
      pageCount:
        currentTab === EActivityTableTabs.HISTORICAL_ACTIVITY
          ? Math.ceil(extrinsicCount / pageSize)
          : -1,
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      enableSorting: false,
    }),
    paginationState: pagination,
    tableLoading: dataLoading || dataParsing || loading,
  };
};
