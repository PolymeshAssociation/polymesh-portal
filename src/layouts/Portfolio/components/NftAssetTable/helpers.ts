import { Nft } from '@polymeshassociation/polymesh-sdk/types';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import {
  IMovementQueryResponse,
  ITransactionsQueryResponse,
} from '~/constants/queries/types';
import { toParsedDateTime } from '~/helpers/dateTime';
import { getNftImageUrl } from '../NftView/helpers';
import {
  INftMovementItem,
  ICollectionItem,
  INftTransactionItem,
} from './constants';

export const parseSingleNftFromPortfolio = async (
  nft: Nft,
  isLocked: boolean,
) => {
  const imgUrl = await getNftImageUrl(nft);
  return {
    ticker: {
      imgUrl: imgUrl || '',
    },
    id: nft.id.toNumber(),
    isLocked,
  };
};

export const parseCollectionFromPortfolio = async ({
  portfolio,
}: IPortfolioData) => {
  const collectionsList = await portfolio.getCollections();
  const parsedCollectionsList = (
    await Promise.all(
      collectionsList.map(async ({ collection, free, locked, total }) => {
        const [{ name, assetType }, collectionId] = await Promise.all([
          collection.details(),
          collection.getCollectionId(),
        ]);

        const imgUrl = await getNftImageUrl(free[0] || locked[0]);
        return {
          collectionId: collectionId.toString(),
          ticker: {
            ticker: collection.ticker,
            imgUrl: imgUrl || '',
          },
          name,
          assetType,
          count: total.toNumber(),
        };
      }),
    )
  ).sort((a, b) => a.ticker.ticker.localeCompare(b.ticker.ticker));
  return parsedCollectionsList;
};

export const parseCollectionFromPortfolios = async (
  portfolios: IPortfolioData[],
) => {
  const collections = await Promise.all(
    portfolios.map(async (portfolio) => {
      const parsedCollectionsList =
        await parseCollectionFromPortfolio(portfolio);
      return parsedCollectionsList;
    }),
  );
  const list = collections
    .flat()
    .reduce((acc, val) => {
      const exists = acc.findIndex(
        (elem) => elem.ticker.ticker === val.ticker.ticker,
      );
      if (exists < 0) {
        return [...acc, val];
      }
      const newAcc = [...acc];
      newAcc[exists] = {
        ...acc[exists],
        count: acc[exists].count + val.count,
      };
      return newAcc;
    }, [] as ICollectionItem[])
    .sort((a, b) => a.ticker.ticker!.localeCompare(b.ticker.ticker!));

  return list;
};

export const parseNftAssetsFromPortfolio = async ({
  portfolio,
}: IPortfolioData) => {
  const collectionsList = await portfolio.getCollections();
  const parsedNftsList = await Promise.all(
    collectionsList.map(async ({ free, locked, collection: rawCollection }) => {
      const { name: collectionName } = await rawCollection.details();
      const freeNfts = await Promise.all(
        free.map(async (nft) => {
          const parsedNft = await parseSingleNftFromPortfolio(nft, false);
          return {
            ...parsedNft,
            collectionTicker: rawCollection.ticker,
            collectionName,
          };
        }),
      );
      const lockedNfts = await Promise.all(
        locked.map(async (nft) => {
          const parsedNft = await parseSingleNftFromPortfolio(nft, true);
          return {
            ...parsedNft,
            collectionTicker: rawCollection.ticker,
            collectionName,
          };
        }),
      );
      return [freeNfts, lockedNfts];
    }),
  );
  return parsedNftsList.flat(3);
};

export const parseNftAssetsFromPortfolios = async (
  portfolios: IPortfolioData[],
) => {
  const nftAssets = await Promise.all(
    portfolios.map(async (portfolio) => {
      const parsedNftsList = await parseNftAssetsFromPortfolio(portfolio);
      return parsedNftsList;
    }),
  );
  return nftAssets.flat();
};

export const parseNftMovements = ({
  portfolioMovements,
}: IMovementQueryResponse) =>
  (portfolioMovements.nodes.map(
    ({ id, nftIds, assetId, from, to, createdBlock }) => ({
      movementId: id.replace('/', '-'),
      collection: assetId,
      dateTime: toParsedDateTime(createdBlock.datetime),
      from: from.name || 'Default',
      to: to.name || 'Default',
      nftIds,
    }),
  ) as INftMovementItem[]) || [];

export const parseNftTransactions = (
  dataFromQuery: ITransactionsQueryResponse,
) => {
  return (
    (dataFromQuery.assetTransactions.nodes.map(
      ({
        id,
        nftIds,
        assetId,
        datetime,
        fromPortfolioId,
        toPortfolioId,
        createdBlockId,
        extrinsicIdx,
        instructionId,
      }) => {
        return {
          txId: {
            eventId: id.replace('/', '-'),
            blockId: createdBlockId,
            extrinsicIdx,
            instructionId,
          },
          dateTime: toParsedDateTime(datetime),
          from: fromPortfolioId ? fromPortfolioId.split('/')[0] : '',
          to: toPortfolioId ? toPortfolioId.split('/')[0] : '',
          assetId,
          nftIds,
        };
      },
    ) as INftTransactionItem[]) || []
  );
};
