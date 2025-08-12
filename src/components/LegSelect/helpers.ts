import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  DefaultPortfolio as DefaultPortfolioInstance,
  NumberedPortfolio as NumberedPortfolioInstance,
} from '@polymeshassociation/polymesh-sdk/internal';
import {
  DefaultPortfolio,
  FungibleAsset,
  Identity,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { ISelectedLegFungible, TSelectedLeg } from './types';

export const getPortfolioDataFromIdentity = async (
  identity: Identity,
  assetId?: string | FungibleAsset,
): Promise<IPortfolioData[]> => {
  if (!identity) return [];

  const portfolios = await identity.portfolios.getPortfolios();

  const defaultP = portfolios[0];
  const numberedP = portfolios.slice(1).sort((a, b) => {
    const first = (a as NumberedPortfolio).id.toString();
    const second = (b as NumberedPortfolio).id.toString();
    return first.localeCompare(second);
  }) as NumberedPortfolio[];

  const parsedPortfolios = await Promise.all(
    [defaultP, ...numberedP].map(async (portfolio, idx) => {
      // Only fetch balances for specific asset if provided
      const assets = assetId
        ? await portfolio.getAssetBalances({ assets: [assetId] })
        : await portfolio.getAssetBalances();

      const data = {
        assets,
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
        id: (portfolio as NumberedPortfolio).id.toString(),
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
    if (!leg.from || !leg.asset) {
      return false;
    }

    return (
      leg.asset === asset.id &&
      (leg.from as DefaultPortfolio | NumberedPortfolio).owner.did === sender
    );
  });

  return (totalSameAssets as ISelectedLegFungible[]).reduce(
    (acc, { from, amount, index }) => {
      if (!from || !amount || index === assetIndex) {
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
        from.id.toString() === portfolioId
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
