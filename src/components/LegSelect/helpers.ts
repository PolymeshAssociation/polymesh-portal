import {
  Identity,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { IPortfolioData } from '~/context/PortfolioContext/constants';

export const getPortfolioDataFromIdentity = async (
  identity: Identity,
): Promise<IPortfolioData[]> => {
  if (!identity) return [];

  const portfolios = await identity.portfolios.getPortfolios();

  const defaultP = portfolios[0];
  const numberedP = portfolios
    .filter((_, idx) => idx !== 0)
    .sort((a, b) => {
      const first = (a as NumberedPortfolio).toHuman().id as string;
      const second = (b as NumberedPortfolio).toHuman().id as string;
      return first.localeCompare(second);
    }) as NumberedPortfolio[];

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

  return portfoliosWithNoZeroBalances;
};
