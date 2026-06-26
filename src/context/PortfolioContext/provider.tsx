import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  AccountCollection,
  DefaultPortfolio,
  NumberedPortfolio,
  PortfolioBalance,
} from '@polymeshassociation/polymesh-sdk/types';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { notifyGlobalError } from '~/helpers/notifications';
import { AccountContext } from '../AccountContext';
import { PolymeshContext } from '../PolymeshContext';
import {
  IAccountData,
  ICombinedPortfolioData,
  IPortfolioData,
} from './constants';
import PortfolioContext from './context';

interface IProviderProps {
  children: React.ReactNode;
}

const PortfolioProvider = ({ children }: IProviderProps) => {
  const {
    state: { initialized },
    api: { sdk },
  } = useContext(PolymeshContext);
  const {
    account,
    identity,
    identityLoading,
    primaryKey,
    primaryKeyLoading,
    secondaryKeys,
    secondaryKeysLoading,
  } = useContext(AccountContext);

  const [defaultPortfolio, setDefaultPortfolio] =
    useState<DefaultPortfolio | null>(null);
  const [numberedPortfolios, setNumberedPortfolios] = useState<
    NumberedPortfolio[]
  >([]);
  const [allPortfolios, setAllPortfolios] = useState<IPortfolioData[]>([]);
  const [accountAssets, setAccountAssets] = useState<PortfolioBalance[]>([]);
  const [accountCollections, setAccountCollections] = useState<
    AccountCollection[]
  >([]);
  const [custodiedPortfolios, setCustodiedPortfolios] = useState<
    IPortfolioData[]
  >([]);
  const [combinedPortfolios, setCombinedPortfolios] =
    useState<ICombinedPortfolioData | null>(null);
  const [totalAssetsAmount, setTotalAssetsAmount] = useState(0);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState('');
  const [allAccountsData, setAllAccountsData] = useState<
    Record<string, IAccountData>
  >({});

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
    // Wait until key loading is complete to avoid a premature fetch with an
    // incomplete address list. By the time both flags are false, identityLoading
    // is also guaranteed false (keys load after identity resolves).
    if (primaryKeyLoading || secondaryKeysLoading || !sdk || !primaryKey) {
      return;
    }

    // Assets and portfolios are both identity-dependent on Polymesh — nothing
    // meaningful to fetch without one.
    if (!identity) {
      setPortfolioLoading(false);
      return;
    }

    const allAddresses = Array.from(
      new Set([
        primaryKey,
        ...secondaryKeys.map(({ account: { address } }) => address),
      ]),
    );

    const sumAccountsTotal = (data: Record<string, IAccountData>): number =>
      Object.values(data).reduce(
        (sum, { assets }) =>
          sum + assets.reduce((s, { total: t }) => s + t.toNumber(), 0),
        0,
      );

    const applyAccountData = (data: Record<string, IAccountData>) => {
      setAllAccountsData(data);
      const selectedAddress = account?.address ?? '';
      setAccountAssets(data[selectedAddress]?.assets ?? []);
      setAccountCollections(data[selectedAddress]?.collections ?? []);
    };

    // Fetch account data and portfolio list in parallel
    setPortfolioLoading(true);
    try {
      const [entries, portfolios] = await Promise.all([
        Promise.all(
          allAddresses.map(async (addr) => {
            try {
              const acc = await sdk.accountManagement.getAccount({
                address: addr,
              });
              const [assets, collections] = await Promise.all([
                acc
                  .getAssetBalances()
                  .then((r) => r.filter(({ total }) => total.toNumber() > 0)),
                acc
                  .getCollections()
                  .then((r) => r.filter(({ total }) => total.toNumber() > 0)),
              ]);
              return [addr, { assets, collections }] as [string, IAccountData];
            } catch (error) {
              notifyGlobalError((error as Error).message);
              return [addr, { assets: [], collections: [] }] as [
                string,
                IAccountData,
              ];
            }
          }),
        ),
        identity.portfolios.getPortfolios(),
      ]);

      const newAllAccountsData = Object.fromEntries(entries);
      applyAccountData(newAllAccountsData);

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

      setTotalAssetsAmount(
        calculateTotalBalance(parsedPortfolios) +
          sumAccountsTotal(newAllAccountsData),
      );
    } catch (error) {
      notifyGlobalError((error as Error).message);
    } finally {
      setPortfolioLoading(false);
    }
  }, [
    account,
    identity,
    primaryKey,
    primaryKeyLoading,
    secondaryKeys,
    secondaryKeysLoading,
    sdk,
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
    setAccountAssets([]);
    setAccountCollections([]);
    setAllAccountsData({});
    setDefaultPortfolio(null);
    setNumberedPortfolios([]);
    setCustodiedPortfolios([]);
    setCombinedPortfolios(null);
    setTotalAssetsAmount(0);
    setPortfolioError('');
    setPortfolioLoading(true);

    if (!initialized || !sdk) return;
    (async () => {
      await getPortfoliosData();
      await getCustodiedPortfoliosData();
    })();
  }, [
    getPortfoliosData,
    getCustodiedPortfoliosData,
    account,
    identity,
    initialized,
    sdk,
  ]);

  const contextValue = useMemo(
    () => ({
      defaultPortfolio,
      numberedPortfolios,
      allPortfolios,
      accountAssets,
      accountCollections,
      allAccountsData,
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
      accountAssets,
      accountCollections,
      allAccountsData,
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
