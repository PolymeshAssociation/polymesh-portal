import { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table';
import { PortfolioContext } from '~/context/PortfolioContext';
import { AccountContext } from '~/context/AccountContext';
import {
  AssetTableItem,
  IMovementQueryResponse,
  EAssetsTableTabs,
  ITransferQueryResponse,
} from './constants';
import { columns } from './config';
import {
  getPortfolioNumber,
  parseAssetsFromPortfolios,
  parseAssetsFromSelectedPortfolio,
  parseMovements,
  parseTransfers,
} from './helpers';
import { notifyError } from '~/helpers/notifications';
import {
  transferEventsQuery,
  portfolioMovementsQuery,
} from '~/helpers/graphqlQueries';
import { gqlClient } from '~/config/graphql';

const initialPaginationState = { pageIndex: 0, pageSize: 10 };

export const useAssetTable = (currentTab: `${EAssetsTableTabs}`) => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>(
    initialPaginationState,
  );

  const [totalPages, setTotalPages] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableData, setTableData] = useState<AssetTableItem[]>([]);
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const { allPortfolios, totalAssetsAmount, portfolioLoading } =
    useContext(PortfolioContext);
  const { identity, identityLoading } = useContext(AccountContext);
  const [tableDataLoading, setTableDataLoading] = useState(false);
  const tabRef = useRef<string>('');
  const portfolioRef = useRef<string | null>(null);

  // Reset page index when tabs are switched
  useEffect(() => {
    if (tableDataLoading) return;

    if (currentTab !== tabRef.current || portfolioId !== portfolioRef.current) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [currentTab, portfolioId, pageSize, tableDataLoading]);

  // Get portfolio movements or asset transfers
  useEffect(() => {
    setTableData([]);
    if (currentTab === EAssetsTableTabs.TOKENS || !identity || portfolioLoading)
      return;

    if (currentTab !== tabRef.current && pageIndex !== 0) return;

    (async () => {
      setTableDataLoading(true);
      const offset = pageIndex * pageSize;

      try {
        switch (currentTab) {
          case EAssetsTableTabs.MOVEMENTS:
            // eslint-disable-next-line no-case-declarations
            const { data: movements } =
              await gqlClient.query<IMovementQueryResponse>({
                query: portfolioMovementsQuery({
                  offset,
                  pageSize,
                  portfolioNumber: getPortfolioNumber(
                    identity.did,
                    portfolioId,
                  ),
                }),
              });
            if (movements) {
              const parsedMovements = parseMovements(movements);
              setTableData(parsedMovements);
              setTotalPages(
                Math.ceil(movements.portfolioMovements.totalCount / pageSize),
              );
              setTotalItems(movements.portfolioMovements.totalCount);
            }
            break;

          case EAssetsTableTabs.TRANSACTIONS:
            // eslint-disable-next-line no-case-declarations
            const { data: transfers } =
              await gqlClient.query<ITransferQueryResponse>({
                query: transferEventsQuery({
                  identityId: identity.did,
                  portfolioId,
                  offset,
                  pageSize,
                }),
              });
            if (transfers) {
              const parsedTransfers = parseTransfers(transfers);
              setTableData(parsedTransfers);
              setTotalPages(Math.ceil(transfers.events.totalCount / pageSize));
              setTotalItems(transfers.events.totalCount);
            }
            break;

          default:
            break;
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        tabRef.current = currentTab;
        portfolioRef.current = portfolioId;
        setTableDataLoading(false);
      }
    })();
  }, [
    currentTab,
    identity,
    portfolioId,
    portfolioLoading,
    pageSize,
    pageIndex,
  ]);

  // Get token table data
  useEffect(() => {
    if (currentTab !== EAssetsTableTabs.TOKENS || !allPortfolios || !identity) {
      return undefined;
    }
    tabRef.current = currentTab;
    portfolioRef.current = portfolioId;
    setTableData([]);

    if (!portfolioId) {
      const parsedAssets = parseAssetsFromPortfolios(
        allPortfolios,
        totalAssetsAmount,
      );
      setTableData(parsedAssets);
      setTotalItems(parsedAssets.length);
      return undefined;
    }

    const selectedPortfolio = allPortfolios.find(
      ({ id }) => id === portfolioId,
    );

    if (selectedPortfolio) {
      const parsedData = parseAssetsFromSelectedPortfolio(selectedPortfolio);
      setTableData(parsedData);
      setTotalItems(parsedData.length);
    }

    return undefined;
  }, [portfolioId, allPortfolios, totalAssetsAmount, currentTab, identity]);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  return {
    table: useReactTable<AssetTableItem>({
      data: tableData,
      columns: columns[currentTab] as ColumnDef<AssetTableItem>[],
      state: { pagination },
      manualPagination: currentTab !== EAssetsTableTabs.TOKENS,
      pageCount:
        currentTab !== EAssetsTableTabs.TOKENS
          ? totalPages
          : Math.ceil(tableData.length ? tableData.length / pageSize : 1),
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
    }),
    tableDataLoading: identityLoading || tableDataLoading || portfolioLoading,
    totalItems,
  };
};
