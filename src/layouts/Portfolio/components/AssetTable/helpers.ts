import { balanceToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import {
  AssetDetails,
  FungibleAsset,
} from '@polymeshassociation/polymesh-sdk/types';
import { hexToUuid } from '@polymeshassociation/polymesh-sdk/utils';
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
import { removeLeadingZeros } from '~/helpers/formatters';

export const getPortfolioNumber = (
  identityId: string | undefined,
  portfolioId: string | null,
) => {
  if (!identityId) return '';
  const portfolioNumber = portfolioId ? Number(portfolioId) : '';

  return `${identityId}/${Number.isNaN(portfolioNumber) ? 0 : portfolioNumber}`;
};

const assetDetailsCache = new Map<string, AssetDetails>();

// Helper function to fetch asset details with caching
const getAssetDetails = async (asset: FungibleAsset) => {
  if (assetDetailsCache.has(asset.id)) {
    const details = assetDetailsCache.get(asset.id);
    return { assetId: asset.id, name: details!.name, ticker: details!.ticker };
  }

  const details = await asset.details();
  assetDetailsCache.set(asset.id, details);
  return { assetId: asset.id, name: details.name, ticker: details.ticker };
};

export const parseAssetsFromPortfolios = async (
  portfolioData: IPortfolioData[],
  totalAssetsAmount: number,
): Promise<ITokenItem[]> => {
  const assetPromises = portfolioData.flatMap(({ assets }) =>
    assets.map(async ({ asset, total, locked }) => {
      const tokenDetails = await getAssetDetails(asset);
      return {
        assetId: asset.id,
        tokenDetails,
        percentage: (total.toNumber() / totalAssetsAmount) * 100,
        balance: total.toNumber(),
        locked: locked.toNumber(),
      } as ITokenItem;
    }),
  );

  const assetsArray = await Promise.all(assetPromises);

  return assetsArray.reduce((acc, asset) => {
    if (acc.find(({ assetId }) => assetId === asset.assetId)) {
      return acc.map((accAsset) => {
        if (accAsset.assetId === asset.assetId) {
          return {
            ...accAsset,
            percentage: accAsset.percentage + asset.percentage,
            balance: accAsset.balance + asset.balance,
          };
        }
        return accAsset;
      });
    }
    return [...acc, asset];
  }, [] as ITokenItem[]);
};

export const parseAssetsFromSelectedPortfolio = async (
  portfolioData: IPortfolioData,
): Promise<ITokenItem[]> => {
  const totalAmount = portfolioData.assets.reduce(
    (acc, { total }) => acc + total.toNumber(),
    0,
  );

  const assetPromises = portfolioData.assets.map(
    async ({ asset, total, locked }) => {
      const tokenDetails = await getAssetDetails(asset);
      return {
        assetId: asset.id,
        tokenDetails,
        percentage:
          total.toNumber() > 0 ? (total.toNumber() / totalAmount) * 100 : 0,
        balance: total.toNumber(),
        locked: locked.toNumber(),
      };
    },
  );

  return Promise.all(assetPromises) as Promise<ITokenItem[]>;
};

export const parseMovements = (
  dataFromQuery: IMovementQueryResponse,
): IMovementItem[] =>
  (dataFromQuery.portfolioMovements.nodes.map(
    ({ id, amount, asset, assetId, from, to, createdBlock }) => {
      const [paddedBlockId, paddedEventIdx] = id.split('/');
      return {
        movementId: `${removeLeadingZeros(paddedBlockId)}-${removeLeadingZeros(paddedEventIdx)}`,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        amount: amount && balanceToBigNumber(amount).toString(),
        assetId: hexToUuid(assetId),
        tokenDetails: asset,
        dateTime: toParsedDateTime(createdBlock.datetime),
        from: from.name || 'Default',
        to: to.name || 'Default',
      };
    },
  ) as IMovementItem[]) || [];

export const parseTransfers = (
  dataFromQuery: ITransactionsQueryResponse,
): ITransactionItem[] => {
  return (
    (dataFromQuery.assetTransactions.nodes.map(
      ({
        amount,
        assetId,
        datetime,
        fromPortfolioId,
        toPortfolioId,
        createdBlock,
        instructionId,
        extrinsicIdx,
        asset,
        eventIdx,
      }) => {
        return {
          id: {
            eventId: `${createdBlock.blockId}-${eventIdx}`,
            blockId: createdBlock.blockId.toString(),
            extrinsicIdx,
            instructionId,
          },
          dateTime: toParsedDateTime(datetime),
          from: fromPortfolioId ? fromPortfolioId.split('/')[0] : '',
          to: toPortfolioId ? toPortfolioId.split('/')[0] : '',
          amount: amount ? (amount / 1_000_000).toString() : '0',
          asset: hexToUuid(assetId),
          tokenDetails: asset,
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
