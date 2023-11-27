import { balanceToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import {
  IIdData,
  ITransactionItem,
  IMovementItem,
  ITokenItem,
} from './constants';
import { toParsedDateTime } from '~/helpers/dateTime';
import {
  IMovementQueryResponse,
  ITransactionsQueryResponse,
} from '~/constants/queries/types';
import { IPortfolioData } from '~/context/PortfolioContext/constants';

export const getPortfolioNumber = (
  identityId: string | undefined,
  portfolioId: string | null,
) => {
  if (!identityId) return '';
  const portfolioNumber = portfolioId ? Number(portfolioId) : '';

  return `${identityId}/${Number.isNaN(portfolioNumber) ? 0 : portfolioNumber}`;
};

export const parseAssetsFromPortfolios = (
  portfolioData: IPortfolioData[],
  totalAssetsAmount: number,
) => {
  return portfolioData
    .flatMap(({ assets }) =>
      assets.map(({ asset, total, locked }) => ({
        ticker: asset.toHuman(),
        percentage: (total.toNumber() / totalAssetsAmount) * 100,
        balance: {
          ticker: asset.toHuman(),
          amount: total.toNumber(),
        },
        locked: {
          ticker: asset.toHuman(),
          amount: locked.toNumber(),
        },
      })),
    )
    .reduce((acc, asset) => {
      if (acc.find(({ ticker }) => ticker === asset.ticker)) {
        return acc.map((accAsset) => {
          if (accAsset.ticker === asset.ticker) {
            return {
              ...accAsset,
              percentage: accAsset.percentage + asset.percentage,
              balance: {
                ...accAsset.balance,
                amount: accAsset.balance.amount + asset.balance.amount,
              },
            };
          }
          return accAsset;
        });
      }
      return [...acc, asset];
    }, [] as ITokenItem[]);
};

export const parseAssetsFromSelectedPortfolio = (
  portfolioData: IPortfolioData,
) => {
  const totalAmount = portfolioData.assets.reduce(
    (acc, { total }) => acc + total.toNumber(),
    0,
  );
  return portfolioData.assets.map(({ asset, total, locked }) => ({
    ticker: asset.toHuman(),
    percentage:
      total.toNumber() > 0 ? (total.toNumber() / totalAmount) * 100 : 0,
    balance: {
      ticker: asset.toHuman(),
      amount: total.toNumber(),
    },
    locked: {
      ticker: asset.toHuman(),
      amount: locked.toNumber(),
    },
  })) as ITokenItem[];
};

export const parseMovements = (dataFromQuery: IMovementQueryResponse) => {
  return (
    (dataFromQuery.portfolioMovements.nodes.map(
      ({ id, amount, assetId, from, to, createdBlock }) => ({
        movementId: id.replace('/', '-'),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        amount: amount && balanceToBigNumber(amount).toString(),
        asset: assetId,
        dateTime: toParsedDateTime(createdBlock.datetime),
        from: from.name || 'Default',
        to: to.name || 'Default',
      }),
    ) as IMovementItem[]) || []
  );
};

export const parseTransfers = (dataFromQuery: ITransactionsQueryResponse) => {
  return (
    (dataFromQuery.assetTransactions.nodes.map(
      ({ id, amount, assetId, datetime, fromPortfolioId, toPortfolioId, createdBlockId, extrinsicIdx }) => {
        return {
          id: {
            eventId: id.replace('/', '-'),
            blockId: createdBlockId,
            extrinsicIdx,
          },
          dateTime: toParsedDateTime(datetime),
          from: fromPortfolioId.split('/')[0],
          to: toPortfolioId.split('/')[0],
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          amount: balanceToBigNumber(amount).toString(),
          asset: assetId,
        };
      },
    ) as ITransactionItem[]) || []
  );
};

export const createTokenActivityLink = (data: IIdData | undefined) => {
  if (!data) return '';

  if (!data.extrinsicIdx) {
    return `${import.meta.env.VITE_SUBSCAN_URL}block/${
      data.blockId
    }?tab=event&&event=${data.eventId}`;
  }

  return `${import.meta.env.VITE_SUBSCAN_URL}extrinsic/${data.blockId}-${
    data.extrinsicIdx
  }?event=${data.eventId}`;
};
