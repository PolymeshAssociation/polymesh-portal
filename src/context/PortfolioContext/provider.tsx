import { useContext, useMemo, useState, useEffect, useCallback } from 'react';
import {
  DefaultPortfolio,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshContext } from '../PolymeshContext';
import { AccountContext } from '../AccountContext';
import PortfolioContext from './context';
import { IPortfolioData } from './constants';
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
  const [totalAssetsAmount, setTotalAssetsAmount] = useState(0);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState('');

  const getPortfoliosData = useCallback(async () => {
    if (!identity) return;

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
    setPortfolioLoading(true);
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
      totalAssetsAmount,
      portfolioLoading,
      portfolioError,
      getPortfoliosData,
    }),
    [
      allPortfolios,
      defaultPortfolio,
      numberedPortfolios,
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
