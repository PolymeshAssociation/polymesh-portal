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
import { AssetTableItem, EAssetsTableTabs } from './constants';
import { columns } from './config';
import {
  getPortfolioNumber,
  parseAssetsFromPortfolios,
  parseAssetsFromSelectedPortfolio,
  parseMovements,
  parseTransfers,
} from './helpers';
import {
  IMovementQueryResponse,
  ITransactionsQueryResponse,
} from '~/constants/queries/types';
import { notifyError } from '~/helpers/notifications';
import {
  transferEventsQuery,
  portfolioMovementsQuery,
} from '~/helpers/graphqlQueries';
import { PolymeshContext } from '~/context/PolymeshContext';

const initialPaginationState = { pageIndex: 0, pageSize: 10 };

export const useAssetTable = (currentTab: EAssetsTableTabs) => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>(
    initialPaginationState,
  );

  const [totalPages, setTotalPages] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableData, setTableData] = useState<AssetTableItem[]>([]);
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const {
    api: { gqlClient },
    state: { middlewareMetadata },
  } = useContext(PolymeshContext);
  const { allPortfolios, totalAssetsAmount, portfolioLoading } =
    useContext(PortfolioContext);
  const { identity } = useContext(AccountContext);
  const [tableDataLoading, setTableDataLoading] = useState(false);
  const tabRef = useRef<EAssetsTableTabs>(EAssetsTableTabs.TOKENS);
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
    if (
      currentTab === EAssetsTableTabs.TOKENS ||
      portfolioLoading ||
      !identity ||
      !gqlClient ||
      !middlewareMetadata
    ) {
      return;
    }

    if (currentTab !== tabRef.current && pageIndex !== 0) return;
    setTableDataLoading(true);

    (async () => {
      const offset = pageIndex * pageSize;

      try {
        switch (currentTab) {
          case EAssetsTableTabs.MOVEMENTS: {
            const { data: movements } =
              await gqlClient.query<IMovementQueryResponse>({
                query: portfolioMovementsQuery({
                  offset,
                  pageSize,
                  type: 'Fungible',
                  portfolioNumber: getPortfolioNumber(
                    identity.did,
                    portfolioId,
                  ),
                  paddedIds: middlewareMetadata.paddedIds,
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
          }
          case EAssetsTableTabs.TRANSACTIONS: {
            const { data: transfers } =
              await gqlClient.query<ITransactionsQueryResponse>({
                query: transferEventsQuery({
                  identityId: identity.did,
                  portfolioId,
                  offset,
                  pageSize,
                  nonFungible: false,
                  paddedIds: middlewareMetadata.paddedIds,
                }),
              });
            if (transfers) {
              const parsedTransfers = parseTransfers(transfers);
              setTableData(parsedTransfers);
              setTotalPages(
                Math.ceil(transfers.assetTransactions.totalCount / pageSize),
              );
              setTotalItems(transfers.assetTransactions.totalCount);
            }
            break;
          }
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
    gqlClient,
    middlewareMetadata,
  ]);

  // Get token table data
  useEffect(() => {
    const fetchAssets = async () => {
      if (!identity || !allPortfolios) {
        setTableData([]);
        return;
      }
      if (currentTab !== EAssetsTableTabs.TOKENS) {
        return;
      }
      setTableDataLoading(true);

      tabRef.current = currentTab;
      portfolioRef.current = portfolioId;
      setTableData([]);

      if (!portfolioId) {
        const parsedAssets = await parseAssetsFromPortfolios(
          allPortfolios,
          totalAssetsAmount,
        );
        setTableData(parsedAssets);
        setTotalItems(parsedAssets.length);
        setTableDataLoading(false);
        return;
      }

      const selectedPortfolio = allPortfolios.find(
        ({ id }) => id === portfolioId,
      );

      if (selectedPortfolio) {
        const parsedData =
          await parseAssetsFromSelectedPortfolio(selectedPortfolio);
        setTableData(parsedData);
        setTotalItems(parsedData.length);
        setTableDataLoading(false);
      }
    };

    fetchAssets();
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
      columns: columns[tabRef.current] as ColumnDef<AssetTableItem>[],
      state: { pagination },
      manualPagination: tabRef.current !== EAssetsTableTabs.TOKENS,
      pageCount:
        tabRef.current !== EAssetsTableTabs.TOKENS
          ? totalPages
          : Math.ceil(tableData.length ? tableData.length / pageSize : 1),
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
    }),
    tableDataLoading:
      tableDataLoading || portfolioLoading || currentTab !== tabRef.current,
    totalItems,
  };
};
