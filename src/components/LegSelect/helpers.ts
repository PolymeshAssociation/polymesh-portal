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
import { ISelectedLeg } from './types';

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
}: {
  asset: FungibleAsset;
  selectedLegs: ISelectedLeg[];
  sender: string;
  portfolioId: string | undefined;
}) => {
  const totalSameAssets = selectedLegs.filter((leg) => {
    return (
      leg.asset === asset.toHuman() &&
      (leg.from as DefaultPortfolio | NumberedPortfolio).toHuman().did ===
        sender
    );
  });

  return totalSameAssets.reduce((acc, { from, amount }) => {
    if (from instanceof DefaultPortfolioInstance && portfolioId === 'default') {
      return acc + amount;
    }
    if (
      from instanceof NumberedPortfolioInstance &&
      from.toHuman().id === portfolioId
    ) {
      return acc + amount;
    }
    return acc;
  }, 0);
};

export const checkAvailableBalance = ({
  asset,
  balance,
  selectedLegs,
  sender,
  portfolioId,
}: {
  asset: FungibleAsset;
  balance: BigNumber | number;
  selectedLegs: ISelectedLeg[];
  sender: string;
  portfolioId: string | undefined;
}) => {
  const freeBalance =
    balance instanceof BigNumber ? balance.toNumber() : balance;

  const totalSelectedInSamePortfolio = getTotalSelectedInSamePortfolio({
    asset,
    selectedLegs,
    sender,
    portfolioId,
  });

  return freeBalance - totalSelectedInSamePortfolio;
};

export const validateTotalSelected = ({
  asset,
  selectedLegs,
  sender,
  portfolioId,
  inputValue,
  initialFreeBalance,
  index,
}: {
  asset: FungibleAsset;
  selectedLegs: ISelectedLeg[];
  sender: string;
  portfolioId: string | undefined;
  inputValue: string;
  initialFreeBalance: number;
  index: number;
}) => {
  const totalSameAssetsWithOtherIndexes = selectedLegs.filter((leg) => {
    return (
      leg.index !== index &&
      leg.asset === asset.toHuman() &&
      (leg.from as DefaultPortfolio | NumberedPortfolio).toHuman().did ===
        sender
    );
  });
  const totalAmountExceptCurrentIndex = totalSameAssetsWithOtherIndexes.reduce(
    (acc, { from, amount }) => {
      if (
        from instanceof DefaultPortfolioInstance &&
        portfolioId === 'default'
      ) {
        return acc + amount;
      }
      if (
        from instanceof NumberedPortfolioInstance &&
        from.toHuman().id === portfolioId
      ) {
        return acc + amount;
      }
      return acc;
    },
    0,
  );

  return (
    totalAmountExceptCurrentIndex + Number(inputValue) > initialFreeBalance
  );
};
