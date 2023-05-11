import { useContext, useMemo, useState, useEffect, useCallback } from 'react';
import {
  DefaultPortfolio,
  NumberedPortfolio,
  PortfolioBalance,
} from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { PolymeshContext } from '../PolymeshContext';
import { AccountContext } from '../AccountContext';
import PortfolioContext from './context';
import { ICombinedPortfolioData, IPortfolioData } from './constants';
import { notifyGlobalError } from '~/helpers/notifications';

interface IProviderProps {
  children: React.ReactNode;
}

const PortfolioProvider = ({ children }: IProviderProps) => {
  const {
    state: { initialized },
    api: { sdk },
  } = useContext(PolymeshContext);
  const { identity } = useContext(AccountContext);

  const [defaultPortfolio, setDefaultPortfolio] =
    useState<DefaultPortfolio | null>(null);
  const [numberedPortfolios, setNumberedPortfolios] = useState<
    NumberedPortfolio[]
  >([]);
  const [allPortfolios, setAllPortfolios] = useState<IPortfolioData[]>([]);
  const [combinedPortfolios, setCombinedPortfolios] =
    useState<ICombinedPortfolioData | null>(null);
  const [totalAssetsAmount, setTotalAssetsAmount] = useState(0);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState('');

  const getPortfoliosData = useCallback(async () => {
    if (!identity) return;
    setPortfolioLoading(true);
    try {
      const portfolios = await identity.portfolios.getPortfolios();

      const defaultP = portfolios[0];
      const numberedP = portfolios
        .filter((_, idx) => idx !== 0)
        .sort((a, b) => {
          const first = (a as NumberedPortfolio).toHuman().id as string;
          const second = (b as NumberedPortfolio).toHuman().id as string;
          return first.localeCompare(second);
        }) as NumberedPortfolio[];

      setDefaultPortfolio(defaultP);
      setNumberedPortfolios(numberedP);

      const parsedPortfolios = await Promise.all(
        [defaultP, ...numberedP].map(async (portfolio, idx) => {
          const data = {
            assets: await portfolio.getAssetBalances(),
            custodian: await portfolio.getCustodian(),
            portfolio,
          };
          if (idx === 0)
            return {
              name: 'Default',
              id: 'default',
              ...data,
            };

          return {
            name: await (portfolio as NumberedPortfolio).getName(),
            id: (portfolio as NumberedPortfolio).toHuman().id as string,
            ...data,
          };
        }),
      );

      const portfoliosWithNoZeroBalances = parsedPortfolios.map((item) => ({
        ...item,
        assets: item.assets.filter(({ total }) => total.toNumber() > 0),
      }));

      setAllPortfolios(portfoliosWithNoZeroBalances);

      const combineAssets = (assets: PortfolioBalance[]) => {
        const reducedAssets = assets.reduce((acc: PortfolioBalance[], curr) => {
          if (!acc.length) return [curr];

          const duplicate = acc.find(
            (accItem) =>
              (accItem as PortfolioBalance).asset.toHuman() ===
              curr.asset.toHuman(),
          );
          if (duplicate) {
            return [
              ...acc.filter(
                (accItem) =>
                  (accItem as PortfolioBalance).asset.toHuman() !==
                  curr.asset.toHuman(),
              ),
              {
                ...curr,
                free: new BigNumber(
                  duplicate.free.toNumber() + curr.free.toNumber(),
                ),
                locked: new BigNumber(
                  duplicate.locked.toNumber() + curr.locked.toNumber(),
                ),
                total: new BigNumber(
                  duplicate.total.toNumber() + curr.total.toNumber(),
                ),
              },
            ];
          }

          return [...acc, curr];
        }, [] as PortfolioBalance[]);

        return reducedAssets;
      };

      const combined = portfoliosWithNoZeroBalances.reduce(
        (acc, { assets, portfolio, custodian }) => ({
          name: 'Combined',
          id: 'combined',
          custodian,
          portfolio: acc.portfolio
            ? [...acc.portfolio, portfolio]
            : [portfolio],
          assets: acc.assets ? [...acc.assets, ...assets] : assets,
        }),
        {} as ICombinedPortfolioData,
      );
      setCombinedPortfolios({
        ...combined,
        assets: combineAssets(combined.assets),
      });

      const totalBalance = parsedPortfolios.reduce((prevValue, { assets }) => {
        if (!assets.length) return prevValue;

        const balances = assets.map((asset) => asset.total.toNumber());
        return prevValue + balances.reduce((acc, balance) => acc + balance, 0);
      }, 0);
      setTotalAssetsAmount(totalBalance);
    } catch (error) {
      notifyGlobalError((error as Error).message);
    } finally {
      setPortfolioLoading(false);
    }
  }, [identity]);

  useEffect(() => {
    setAllPortfolios([]);
    setTotalAssetsAmount(0);
    setPortfolioError('');

    if (!initialized || !sdk) return;
    (async () => {
      await getPortfoliosData();
    })();
  }, [getPortfoliosData, identity, initialized, sdk]);

  const contextValue = useMemo(
    () => ({
      defaultPortfolio,
      numberedPortfolios,
      allPortfolios,
      combinedPortfolios,
      totalAssetsAmount,
      portfolioLoading,
      portfolioError,
      getPortfoliosData,
    }),
    [
      allPortfolios,
      defaultPortfolio,
      numberedPortfolios,
      combinedPortfolios,
      totalAssetsAmount,
      portfolioError,
      portfolioLoading,
      getPortfoliosData,
    ],
  );

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioProvider;
