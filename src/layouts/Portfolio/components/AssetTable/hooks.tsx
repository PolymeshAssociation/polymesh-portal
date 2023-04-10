import { useState, useEffect, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
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
  ITokenItem,
  AssetTableItem,
  IMovementQueryResponse,
  EAssetsTableTabs,
  ITransferQueryResponse,
} from './constants';
import { columns } from './config';
import { getPortfolioNumber, parseMovements, parseTransfers } from './helpers';
import { notifyError } from '~/helpers/notifications';
import {
  getPaginatedAssetTransferEvents,
  getPortfolioMovements,
} from '~/constants/queries';

const initialPaginationState = { pageIndex: 0, pageSize: 3 };

export const useAssetTable = (currentTab: `${EAssetsTableTabs}`) => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>(
    initialPaginationState,
  );
  const offset = pageIndex * pageSize;
  const [totalPages, setTotalPages] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableData, setTableData] = useState<AssetTableItem[]>([]);
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const { allPortfolios, totalAssetsAmount, portfolioLoading } =
    useContext(PortfolioContext);
  const { identity } = useContext(AccountContext);
  const [
    fetchMovements,
    { fetchMore: moreMovements, called: movementsCalled },
  ] = useLazyQuery<IMovementQueryResponse>(getPortfolioMovements);
  const [
    fetchTransfers,
    { fetchMore: moreTransfers, called: transfersCalled },
  ] = useLazyQuery<ITransferQueryResponse>(getPaginatedAssetTransferEvents);
  const [tableDataLoading, setTableDataLoading] = useState(false);

  // Get portfolio movements or asset transfers
  useEffect(() => {
    if (currentTab === EAssetsTableTabs.TOKENS || !identity || portfolioLoading)
      return;

    (async () => {
      setTableData([]);
      setTableDataLoading(true);

      try {
        switch (currentTab) {
          case EAssetsTableTabs.MOVEMENTS:
            // eslint-disable-next-line no-case-declarations
            const { data: movements } = movementsCalled
              ? await moreMovements({
                  variables: { offset },
                })
              : await fetchMovements({
                  variables: {
                    pageSize,
                    offset,
                    portfolioNumber: getPortfolioNumber(
                      identity.did,
                      portfolioId,
                    ),
                  },
                  notifyOnNetworkStatusChange: true,
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
            const { data: transfers } = transfersCalled
              ? await moreTransfers({
                  variables: { offset },
                })
              : await fetchTransfers({
                  variables: {
                    pageSize,
                    offset,
                    did: identity.did,
                  },
                  notifyOnNetworkStatusChange: true,
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
        setTableDataLoading(false);
      }
    })();
  }, [
    currentTab,
    identity,
    portfolioId,
    portfolioLoading,
    transfersCalled,
    movementsCalled,
    fetchMovements,
    fetchTransfers,
    moreMovements,
    moreTransfers,
    offset,
    pageSize,
  ]);

  // Get token table data
  useEffect(() => {
    if (currentTab !== EAssetsTableTabs.TOKENS || !allPortfolios || !identity) {
      return undefined;
    }

    setTableData([]);

    if (!portfolioId) {
      const reducedPortfolios = allPortfolios
        .flatMap(({ assets }) =>
          assets.map(({ asset, total }) => ({
            ticker: asset.toHuman(),
            percentage: (total.toNumber() / totalAssetsAmount) * 100,
            balance: {
              ticker: asset.toHuman(),
              amount: total.toNumber(),
            },
          })),
        )
        .reduce((acc, asset) => {
          if (acc.find(({ ticker }) => ticker === asset.ticker)) {
            return acc.map((accAsset) => {
              if (accAsset.ticker === asset.ticker) {
                return {
                  ...accAsset,
                  percentage: accAsset.percentage + asset.percentage,
                  balance: {
                    ...accAsset.balance,
                    amount: accAsset.balance.amount + asset.balance.amount,
                  },
                };
              }
              return accAsset;
            });
          }
          return [...acc, asset];
        }, [] as ITokenItem[]);
      setTableData(reducedPortfolios);
      setTotalItems(reducedPortfolios.length);
      return undefined;
    }

    const selectedPortfolio = allPortfolios.find(
      ({ id }) => id === portfolioId,
    );

    if (selectedPortfolio) {
      const totalAmount = selectedPortfolio.assets.reduce(
        (acc, { total }) => acc + total.toNumber(),
        0,
      );
      const parsedData = selectedPortfolio.assets.map(({ asset, total }) => ({
        ticker: asset.toHuman(),
        percentage:
          total.toNumber() > 0 ? (total.toNumber() / totalAmount) * 100 : 0,
        balance: {
          ticker: asset.toHuman(),
          amount: total.toNumber(),
        },
      }));
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
    setTableData: () => {},
    tableDataLoading: tableDataLoading || portfolioLoading,
    totalItems,
  };
};
