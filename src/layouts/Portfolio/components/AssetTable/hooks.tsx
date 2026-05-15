import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  IMovementQueryResponse,
  ITransactionsQueryResponse,
} from '~/constants/queries/types';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import {
  portfolioMovementsQuery,
  transferEventsQuery,
} from '~/helpers/graphqlQueries';
import { notifyError } from '~/helpers/notifications';
import { EBalanceHolder, getBalanceHolder } from '../../helpers';
import { columns } from './config';
import { AssetTableItem, EAssetsTableTabs, ITokenItem } from './constants';
import {
  getPortfolioNumber,
  parseAssetsFromBalances,
  parseAssetsFromPortfolios,
  parseAssetsFromSelectedPortfolio,
  parseMovements,
  parseTransfers,
} from './helpers';

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
  const holder = searchParams.get('holder');
  const selectedHolder = getBalanceHolder(holder, portfolioId);
  const selectedPortfolioId =
    selectedHolder === EBalanceHolder.PORTFOLIO ? portfolioId : null;
  const {
    api: { gqlClient },
    state: { middlewareMetadata },
  } = useContext(PolymeshContext);
  const {
    allPortfolios,
    totalAssetsAmount,
    portfolioLoading,
    allAccountsData,
  } = useContext(PortfolioContext);
  const { identity } = useContext(AccountContext);
  const [tableDataLoading, setTableDataLoading] = useState(false);
  const tabRef = useRef<EAssetsTableTabs>(EAssetsTableTabs.TOKENS);
  const portfolioRef = useRef<string | null>(null);

  const address = searchParams.get('address');

  // Reset page index when tabs are switched
  useEffect(() => {
    if (tableDataLoading) return;

    if (
      currentTab !== tabRef.current ||
      selectedPortfolioId !== portfolioRef.current
    ) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [currentTab, selectedPortfolioId, pageSize, tableDataLoading]);

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
            const getMovementFilterParams = () => {
              if (selectedHolder === EBalanceHolder.ACCOUNT) {
                return { accountAddress: address };
              }
              if (selectedHolder === EBalanceHolder.ALL) {
                return { identityId: identity.did };
              }
              return {
                portfolioNumber: getPortfolioNumber(
                  identity.did,
                  selectedPortfolioId,
                ),
              };
            };
            const { data: movements } =
              await gqlClient.query<IMovementQueryResponse>({
                query: portfolioMovementsQuery({
                  offset,
                  pageSize,
                  type: 'Fungible',
                  ...getMovementFilterParams(),
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
                  portfolioId: selectedPortfolioId,
                  accountAddress:
                    selectedHolder === EBalanceHolder.ACCOUNT ? address : null,
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
        portfolioRef.current = selectedPortfolioId;
        setTableDataLoading(false);
      }
    })();
  }, [
    currentTab,
    identity,
    selectedPortfolioId,
    portfolioLoading,
    pageSize,
    pageIndex,
    selectedHolder,
    address,
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
      portfolioRef.current = selectedPortfolioId;
      setTableData([]);

      if (selectedHolder === EBalanceHolder.ACCOUNT) {
        const accountData = allAccountsData[address ?? '']?.assets ?? [];
        const accountTotalAmount = accountData.reduce(
          (acc, { total }) => acc + total.toNumber(),
          0,
        );
        const parsedAssets = await parseAssetsFromBalances(
          accountData,
          accountTotalAmount,
        );
        setTableData(parsedAssets);
        setTotalItems(parsedAssets.length);
        setTableDataLoading(false);
        return;
      }

      if (selectedHolder === EBalanceHolder.ALL) {
        const allAccountAssets = Object.values(allAccountsData).flatMap(
          ({ assets }) => assets,
        );
        const [portfolioAssets, accountHolderAssets] = await Promise.all([
          parseAssetsFromPortfolios(allPortfolios, totalAssetsAmount),
          parseAssetsFromBalances(allAccountAssets, totalAssetsAmount),
        ]);

        const parsedAssets = [
          ...portfolioAssets,
          ...accountHolderAssets,
        ].reduce((acc, asset) => {
          const existing = acc.find(({ assetId }) => assetId === asset.assetId);

          if (!existing) {
            return [...acc, asset];
          }

          return acc.map((item) => {
            if (item.assetId === asset.assetId) {
              return {
                ...item,
                percentage: item.percentage + asset.percentage,
                balance: item.balance + asset.balance,
                locked: item.locked + asset.locked,
              };
            }

            return item;
          });
        }, [] as ITokenItem[]);

        setTableData(parsedAssets);
        setTotalItems(parsedAssets.length);
        setTableDataLoading(false);
        return;
      }

      const selectedPortfolio = allPortfolios.find(
        ({ id }) => id === selectedPortfolioId,
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
  }, [
    selectedPortfolioId,
    selectedHolder,
    address,
    allPortfolios,
    allAccountsData,
    totalAssetsAmount,
    currentTab,
    identity,
  ]);

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
