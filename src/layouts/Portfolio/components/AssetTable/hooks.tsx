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
import { balanceToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { PortfolioContext } from '~/context/PortfolioContext';
import { AccountContext } from '~/context/AccountContext';
import { getTimeByBlockHash } from '~/helpers/graphqlQueries';
import {
  ITokenItem,
  AssetTableItem,
  IMovementQueryResponse,
  EAssetsTableTabs,
} from './constants';
import { columns } from './config';
import { notifyError } from '~/helpers/notifications';
import { getPortfolioMovements } from '~/constants/queries';
import { getPortfolioNumber } from './helpers';
import { toParsedDateTime } from '~/helpers/dateTime';

export const useAssetTable = (currentTab: `${EAssetsTableTabs}`) => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 3,
  });
  // const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(-1);
  const [tableData, setTableData] = useState<AssetTableItem[]>([]);
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const { allPortfolios, totalAssetsAmount, portfolioLoading } =
    useContext(PortfolioContext);
  const { identity } = useContext(AccountContext);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
  const [_, { data, loading, error: moError, fetchMore: fetchMoreMovements }] =
    useLazyQuery<IMovementQueryResponse>(getPortfolioMovements, {
      variables: {
        pageSize,
        offset: pageIndex * pageSize,
        portfolioNumber: getPortfolioNumber(identity?.did, portfolioId),
      },
      notifyOnNetworkStatusChange: true,
    });
  const [tableDataLoading, setTableDataLoading] = useState(false);

  // Fetch portfolio movements
  useEffect(() => {
    if (
      currentTab !== EAssetsTableTabs.MOVEMENTS ||
      !identity ||
      portfolioLoading
    )
      return;

    (async () => {
      await fetchMoreMovements({
        variables: {
          offset: pageIndex * pageSize,
        },
      });
      if (data) {
        setTableData(
          data.portfolioMovements.nodes.map(
            ({ id, amount, assetId, from, to, createdBlock }) => ({
              id,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              amount: balanceToBigNumber(amount).toString(),
              asset: assetId,
              dateTime: toParsedDateTime(createdBlock.datetime),
              from: from.name || 'Default',
              to: to.name || 'Default',
            }),
          ) || [],
        );
        setTotalPages(Math.ceil(data.portfolioMovements.totalCount / pageSize));
      }
    })();
  }, [
    currentTab,
    pageIndex,
    fetchMoreMovements,
    pageSize,
    data,
    identity,
    portfolioLoading,
    portfolioId,
  ]);

  useEffect(() => {
    if (
      !allPortfolios ||
      !identity ||
      currentTab === EAssetsTableTabs.MOVEMENTS
    ) {
      return undefined;
    }

    setTableData([]);

    if (!portfolioId) {
      switch (currentTab) {
        case EAssetsTableTabs.TOKENS:
          // eslint-disable-next-line no-case-declarations
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
          break;

        case EAssetsTableTabs.TRANSACTIONS:
          (async () => {
            setTableDataLoading(true);
            try {
              const transactionHistory = await Promise.all(
                allPortfolios.map((item) =>
                  item.portfolio.getTransactionHistoryV2(),
                ),
              );
              const parsedHistory = await Promise.all(
                transactionHistory
                  .flat()
                  .map(async ({ blockHash, blockNumber, legs }) => ({
                    id: blockNumber.toString(),
                    dateTime: await getTimeByBlockHash(blockHash),
                    from: legs[0].from.toHuman().did,
                    to: legs[0].to.toHuman().did,
                    direction: legs[0].direction,
                    amount: legs[0].amount.toString(),
                    asset: legs[0].asset.toHuman(),
                  })),
              );

              setTableData(
                parsedHistory.sort((a, b) => {
                  return Number(b.id) - Number(a.id);
                }),
              );
            } catch (error) {
              notifyError((error as Error).message);
            } finally {
              setTableDataLoading(false);
            }
          })();

          break;

        default:
          break;
      }
      return undefined;
    }

    const selectedPortfolio = allPortfolios.find(
      ({ id }) => id === portfolioId,
    );

    if (selectedPortfolio) {
      switch (currentTab) {
        case EAssetsTableTabs.TOKENS:
          // eslint-disable-next-line no-case-declarations
          const totalAmount = selectedPortfolio.assets.reduce(
            (acc, { total }) => acc + total.toNumber(),
            0,
          );
          // eslint-disable-next-line no-case-declarations
          const parsedData = selectedPortfolio.assets.map(
            ({ asset, total }) => ({
              ticker: asset.toHuman(),
              percentage:
                total.toNumber() > 0
                  ? (total.toNumber() / totalAmount) * 100
                  : 0,
              balance: {
                ticker: asset.toHuman(),
                amount: total.toNumber(),
              },
            }),
          );
          setTableData(parsedData);
          break;

        case EAssetsTableTabs.TRANSACTIONS:
          (async () => {
            setTableDataLoading(true);
            try {
              const transactionHistory =
                await selectedPortfolio.portfolio.getTransactionHistoryV2();
              const parsedHistory = await Promise.all(
                transactionHistory.map(
                  async ({ blockHash, blockNumber, legs }) => ({
                    id: blockNumber.toString(),
                    dateTime: await getTimeByBlockHash(blockHash),
                    from: legs[0].from.toHuman().did,
                    to: legs[0].to.toHuman().did,
                    direction: legs[0].direction,
                    amount: legs[0].amount.toString(),
                    asset: legs[0].asset.toHuman(),
                  }),
                ),
              );

              setTableData(
                parsedHistory.sort((a, b) => {
                  return Number(b.id) - Number(a.id);
                }),
              );
            } catch (error) {
              notifyError((error as Error).message);
            } finally {
              setTableDataLoading(false);
            }
          })();
          break;

        default:
          break;
      }
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
      // data: tableData.slice(
      //   pageIndex * pageSize,
      //   pageIndex * pageSize + pageSize,
      // ),
      data: tableData,
      columns: columns[currentTab] as ColumnDef<AssetTableItem>[],
      state: { pagination },
      manualPagination: currentTab === EAssetsTableTabs.MOVEMENTS,
      pageCount:
        currentTab === EAssetsTableTabs.MOVEMENTS
          ? totalPages
          : Math.ceil(tableData.length ? tableData.length / pageSize : 1),
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
    }),
    setTableData: () => {},
    tableDataLoading: loading || portfolioLoading || tableDataLoading,
  };
};
