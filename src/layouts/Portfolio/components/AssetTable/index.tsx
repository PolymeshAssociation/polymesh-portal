import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountContext } from '~/context/AccountContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { Table } from '~/components';
import { getTimeByBlockHash } from '~/helpers/graphqlQueries';
import { notifyError } from '~/helpers/notifications';
import { useAssetTable } from './config';
import { EAssetsTableTabs, ITokenItem } from './constants';

export const AssetTable = () => {
  const [tab, setTab] = useState<`${EAssetsTableTabs}`>(
    EAssetsTableTabs.TOKENS,
  );
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const { allPortfolios, totalAssetsAmount, portfolioLoading } =
    useContext(PortfolioContext);
  const { identity } = useContext(AccountContext);
  const { table, setTableData } = useAssetTable(tab);
  const [tableDataLoading, setTableDataLoading] = useState(false);

  useEffect(() => {
    if (!allPortfolios || !identity) {
      return undefined;
    }

    setTableData([]);

    if (!portfolioId) {
      switch (tab) {
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
      switch (tab) {
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
  }, [
    portfolioId,
    allPortfolios,
    totalAssetsAmount,
    setTableData,
    tab,
    identity,
  ]);

  return (
    <Table
      title="Assets"
      data={{ table, tab }}
      loading={portfolioLoading || tableDataLoading}
      tabs={Object.values(EAssetsTableTabs)}
      setTab={setTab}
    />
  );
};
