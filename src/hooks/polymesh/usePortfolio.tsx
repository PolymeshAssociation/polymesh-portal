import {
  DefaultPortfolio,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useEffect, useState } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';

const usePortfolio = () => {
  const {
    state: { initialized },
    api: { sdk },
  } = useContext(PolymeshContext);

  const [defaultPortfolio, setDefaultPortfolio] =
    useState<DefaultPortfolio>(null);
  const [numberedPortfolios, setNumberedPortfolios] = useState<
    NumberedPortfolio[]
  >([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState('');

  useEffect(() => {
    if (!initialized || !sdk) return;

    (async () => {
      setPortfolioLoading(true);
      setPortfolioError('');
      try {
        const account = await sdk.accountManagement.getSigningAccount();
        const identity = await account.getIdentity();
        const portfolios = await identity.portfolios.getPortfolios();
        // const assets = await portfolios[0].getAssetBalances();
        // const meta = await assets[0].asset.documents.get();

        setDefaultPortfolio(portfolios[0]);
        setNumberedPortfolios(portfolios.filter((_, idx) => idx !== 0));

        // const tabs = await Promise.all([
        //   ...portfolios.map(async (portfolio, idx) => {
        //     if (idx === 0) return { name: 'Default', id: 'default' };

        //     return {
        //       name: await (portfolio as NumberedPortfolio).getName(),
        //       id: portfolio.toHuman().id,
        //     };
        //   }),
        // ]);
        // console.log(tabs);
      } catch (error) {
        setPortfolioError(error.message);
      } finally {
        setPortfolioLoading(false);
      }
    })();
  }, [initialized, sdk]);

  return {
    defaultPortfolio,
    numberedPortfolios,
    portfolioLoading,
    portfolioError,
  };
};

export default usePortfolio;
