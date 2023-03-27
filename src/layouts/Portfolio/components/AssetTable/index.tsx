import { useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table } from '~/components';
import { PortfolioContext } from '~/context/PortfolioContext';
import { useAssetTable } from './config';

export const AssetTable = () => {
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const { allPortfolios, totalAssetsAmount } = useContext(PortfolioContext);
  const { table, setTableData } = useAssetTable();

  useEffect(() => {
    if (!allPortfolios) return;

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
        }, []);
      setTableData(reducedPortfolios);
      return;
    }

    const selectedPortfolio = allPortfolios.find(
      ({ id }) => id === portfolioId,
    );

    if (selectedPortfolio) {
      selectedPortfolio.assets.map(({ asset, total }) =>
        setTableData((prev) => [
          ...prev,
          {
            ticker: asset.toHuman(),
            percentage: (total.toNumber() / totalAssetsAmount) * 100,
            balance: {
              ticker: asset.toHuman(),
              amount: total.toNumber(),
            },
          },
        ]),
      );
    }
  }, [portfolioId, allPortfolios, totalAssetsAmount, setTableData]);

  return <Table title="Assets" data={{ table }} />;
};
