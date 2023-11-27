import {
  Identity,
  NumberedPortfolio,
  DefaultPortfolio,
  FungibleAsset,
} from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  DefaultPortfolio as DefaultPortfolioInstance,
  NumberedPortfolio as NumberedPortfolioInstance,
} from '@polymeshassociation/polymesh-sdk/internal';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { TSelectedLeg, ISelectedLegFungible } from './types';

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

export const getTotalSelectedInSamePortfolio = ({
  asset,
  selectedLegs,
  sender,
  portfolioId,
  assetIndex,
}: {
  asset: FungibleAsset;
  selectedLegs: TSelectedLeg[];
  sender: string;
  portfolioId: string | undefined;
  assetIndex: number;
}) => {
  const totalSameAssets = selectedLegs.filter((leg) => {
    return (
      leg.asset === asset.toHuman() &&
      (leg.from as DefaultPortfolio | NumberedPortfolio).toHuman().did ===
        sender
    );
  });

  return (totalSameAssets as ISelectedLegFungible[]).reduce(
    (acc, { from, amount, index }) => {
      if (index === assetIndex) {
        return acc;
      }
      if (
        from instanceof DefaultPortfolioInstance &&
        portfolioId === 'default'
      ) {
        return acc + amount.toNumber();
      }
      if (
        from instanceof NumberedPortfolioInstance &&
        from.toHuman().id === portfolioId
      ) {
        return acc + amount.toNumber();
      }
      return acc;
    },
    0,
  );
};

export const checkAvailableBalance = ({
  asset,
  balance,
  selectedLegs,
  sender,
  portfolioId,
  assetIndex,
}: {
  asset: FungibleAsset;
  balance: BigNumber | number;
  selectedLegs: TSelectedLeg[];
  sender: string;
  portfolioId: string | undefined;
  assetIndex: number;
}) => {
  const freeBalance =
    balance instanceof BigNumber ? balance.toNumber() : balance;

  const totalSelectedInSamePortfolio = getTotalSelectedInSamePortfolio({
    asset,
    selectedLegs,
    sender,
    portfolioId,
    assetIndex,
  });

  return freeBalance - totalSelectedInSamePortfolio;
};
