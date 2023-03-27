import { useContext, useMemo, useState, useEffect, useCallback } from 'react';
import {
  DefaultPortfolio,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshContext } from '../PolymeshContext';
import { AccountContext } from '../AccountContext';
import PortfolioContext from './context';

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
    useState<DefaultPortfolio>(null);
  const [numberedPortfolios, setNumberedPortfolios] = useState<
    NumberedPortfolio[]
  >([]);
  const [allPortfolios, setAllPortfolios] = useState<IPortfolioData[]>([]);
  const [totalAssetsAmount, setTotalAssetsAmount] = useState(0);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState('');

  const getPortfoliosData = useCallback(async () => {
    try {
      const portfolios = await identity.portfolios.getPortfolios();

      setDefaultPortfolio(portfolios[0]);
      setNumberedPortfolios(portfolios.filter((_, idx) => idx !== 0));

      const parsedPortfolios = await Promise.all([
        ...portfolios.map(async (portfolio, idx) => {
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
      ]);
      setAllPortfolios(parsedPortfolios);

      const totalBalance = parsedPortfolios.reduce((prevValue, { assets }) => {
        if (!assets.length) return prevValue;

        const balances = assets.map((asset) => asset.total.toNumber());
        return prevValue + balances.reduce((acc, balance) => acc + balance, 0);
      }, 0);
      setTotalAssetsAmount(totalBalance);
    } catch (error) {
      setPortfolioError(error.message);
    } finally {
      setPortfolioLoading(false);
    }
  }, [identity]);

  useEffect(() => {
    setAllPortfolios([]);
    setTotalAssetsAmount(0);
    setPortfolioLoading(true);
    setPortfolioError('');

    if (!identity || !initialized || !sdk) return;

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
