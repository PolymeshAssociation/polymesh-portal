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
  const { identity, identityLoading } = useContext(AccountContext);

  const [defaultPortfolio, setDefaultPortfolio] =
    useState<DefaultPortfolio | null>(null);
  const [numberedPortfolios, setNumberedPortfolios] = useState<
    NumberedPortfolio[]
  >([]);
  const [allPortfolios, setAllPortfolios] = useState<IPortfolioData[]>([]);
  const [custodiedPortfolios, setCustodiedPortfolios] = useState<
    IPortfolioData[]
  >([]);
  const [combinedPortfolios, setCombinedPortfolios] =
    useState<ICombinedPortfolioData | null>(null);
  const [totalAssetsAmount, setTotalAssetsAmount] = useState(0);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState('');

  // Helper function to parse portfolio data
  const parsePortfolioData = useCallback(
    async (
      portfolio: DefaultPortfolio | NumberedPortfolio,
      isDefaultPortfolio = false,
    ): Promise<IPortfolioData> => {
      const data = {
        assets: await portfolio.getAssetBalances(),
        custodian: await portfolio.getCustodian(),
        portfolio,
      };

      if (isDefaultPortfolio) {
        return {
          name: 'Default',
          id: 'default',
          ...data,
        };
      }

      return {
        name: await (portfolio as NumberedPortfolio).getName(),
        id: (portfolio as NumberedPortfolio).toHuman().id as string,
        ...data,
      };
    },
    [],
  );

  // Helper function to filter portfolios with zero balances
  const filterZeroBalances = useCallback(
    (portfolios: IPortfolioData[]): IPortfolioData[] =>
      portfolios.map((item) => ({
        ...item,
        assets: item.assets.filter(({ total }) => total.toNumber() > 0),
      })),
    [],
  );

  // Helper function to combine assets
  const combineAssets = useCallback((assets: PortfolioBalance[]) => {
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
  }, []);

  // Helper function to calculate total asset balance
  const calculateTotalBalance = useCallback(
    (portfolios: IPortfolioData[]): number =>
      portfolios.reduce((prevValue, { assets }) => {
        if (!assets.length) return prevValue;

        const balances = assets.map((asset) => asset.total.toNumber());
        return prevValue + balances.reduce((acc, balance) => acc + balance, 0);
      }, 0),
    [],
  );

  const getPortfoliosData = useCallback(async () => {
    if (identityLoading || !identity) {
      setPortfolioLoading(identityLoading);
      return;
    }
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

      // Parse portfolios using helper function
      const parsedPortfolios = await Promise.all([
        parsePortfolioData(defaultP, true),
        ...numberedP.map((portfolio) => parsePortfolioData(portfolio, false)),
      ]);

      const portfoliosWithNoZeroBalances = filterZeroBalances(parsedPortfolios);
      setAllPortfolios(portfoliosWithNoZeroBalances);

      // Create combined portfolios
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

      setTotalAssetsAmount(calculateTotalBalance(parsedPortfolios));
    } catch (error) {
      notifyGlobalError((error as Error).message);
    } finally {
      setPortfolioLoading(false);
    }
  }, [
    identity,
    identityLoading,
    parsePortfolioData,
    filterZeroBalances,
    combineAssets,
    calculateTotalBalance,
  ]);

  const getCustodiedPortfoliosData = useCallback(async () => {
    if (identityLoading || !identity) {
      return;
    }

    try {
      const custodiedPortfoliosResult =
        await identity.portfolios.getCustodiedPortfolios();

      if (!custodiedPortfoliosResult.data.length) {
        setCustodiedPortfolios([]);
        return;
      }

      // Parse custodied portfolios using helper function
      const parsedCustodiedPortfolios = await Promise.all(
        custodiedPortfoliosResult.data.map(async (portfolio) => {
          // Check if it's a default portfolio or numbered portfolio
          const isDefaultPortfolio = !('id' in portfolio);
          return parsePortfolioData(portfolio, isDefaultPortfolio);
        }),
      );

      setCustodiedPortfolios(filterZeroBalances(parsedCustodiedPortfolios));
    } catch (error) {
      notifyGlobalError((error as Error).message);
    }
  }, [identity, identityLoading, parsePortfolioData, filterZeroBalances]);

  useEffect(() => {
    setAllPortfolios([]);
    setDefaultPortfolio(null);
    setNumberedPortfolios([]);
    setCustodiedPortfolios([]);
    setCombinedPortfolios(null);
    setTotalAssetsAmount(0);
    setPortfolioError('');

    if (!initialized || !sdk) return;
    (async () => {
      await getPortfoliosData();
      await getCustodiedPortfoliosData();
    })();
  }, [
    getPortfoliosData,
    getCustodiedPortfoliosData,
    identity,
    initialized,
    sdk,
  ]);

  const contextValue = useMemo(
    () => ({
      defaultPortfolio,
      numberedPortfolios,
      allPortfolios,
      custodiedPortfolios,
      combinedPortfolios,
      totalAssetsAmount,
      portfolioLoading,
      portfolioError,
      getPortfoliosData,
      getCustodiedPortfoliosData,
    }),
    [
      allPortfolios,
      custodiedPortfolios,
      defaultPortfolio,
      numberedPortfolios,
      combinedPortfolios,
      totalAssetsAmount,
      portfolioError,
      portfolioLoading,
      getPortfoliosData,
      getCustodiedPortfoliosData,
    ],
  );

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioProvider;
