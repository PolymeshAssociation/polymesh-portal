import { Nft } from '@polymeshassociation/polymesh-sdk/types';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import {
  IMovementQueryResponse,
  ITransactionsQueryResponse,
} from '~/constants/queries/types';
import { toParsedDateTime } from '~/helpers/dateTime';
import { getNftImageUrl } from '../NftView/helpers';
import { INftMovementItem, ICollectionItem } from './constants';
import { INftTransactionItem } from '~/layouts/Overview/components/ActivityTable/constants';

export const parseCollectionFromPortfolio = async ({
  portfolio,
}: IPortfolioData) => {
  const collectionsList = await portfolio.getCollections();
  const parsedCollectionsList = (
    await Promise.all(
      collectionsList.map(async ({ collection, free, locked, total }) => {
        const [{ name, assetType, ticker }, collectionId] = await Promise.all([
          collection.details(),
          collection.getCollectionId(),
        ]);

        const imgUrl = await getNftImageUrl(free[0] || locked[0]);
        return {
          collectionAssetId: collection.id,
          collectionId: collectionId.toString(),
          ticker: {
            assetId: collection.id,
            ticker: ticker || '',
            imgUrl: imgUrl || '',
            name,
          },
          assetType,
          count: total.toNumber(),
        };
      }),
    )
  ).sort((a, b) => a.ticker.assetId.localeCompare(b.ticker.assetId));
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
        (elem) => elem.collectionAssetId === val.collectionAssetId,
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
    .sort((a, b) => a.collectionAssetId.localeCompare(b.collectionAssetId));

  return list;
};

export const parseNftAssetsFromPortfolio = async ({
  portfolio,
}: IPortfolioData) => {
  const collectionsList = await portfolio.getCollections();
  const parsedNftsList = await Promise.all(
    collectionsList.map(async ({ free, locked, collection: rawCollection }) => {
      const [details, collectionId] = await Promise.all([
        rawCollection.details(),
        rawCollection.getCollectionId(),
      ]);
      const { name: collectionName, ticker, assetType } = details;
      const collectionAssetId = rawCollection.id;

      const mapNfts = (nfts: Nft[], isLocked: boolean) =>
        nfts.map((nft) => ({
          assetType,
          nftId: nft.id.toNumber(),
          ticker: {
            assetId: collectionAssetId,
            ticker: ticker || '',
            imgUrl: '',
            name: collectionName,
          },
          isLocked,
          collectionId: collectionId.toString(),
          collectionTicker: ticker,
          collectionAssetId,
          collectionName,
          nft,
        }));

      const freeNfts = mapNfts(free, false);
      const lockedNfts = mapNfts(locked, true);
      return [...freeNfts, ...lockedNfts];
    }),
  );
  return parsedNftsList.flat();
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
    ({ id, nftIds, asset, assetId, from, to, createdBlock }) => ({
      movementId: id.replace('/', '-'),
      collection: assetId,
      nameAndTicker: asset,
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
        asset,
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
          nameAndTicker: asset,
        };
      },
    ) as INftTransactionItem[]) || []
  );
};
