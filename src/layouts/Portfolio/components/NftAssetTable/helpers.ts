import {
  AccountCollection,
  Nft,
} from '@polymeshassociation/polymesh-sdk/types';
import { hexToUuid } from '@polymeshassociation/polymesh-sdk/utils';
import {
  IMovementQueryResponse,
  ITransactionsQueryResponse,
} from '~/constants/queries/types';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { toParsedDateTime } from '~/helpers/dateTime';
import { removeLeadingZeros } from '~/helpers/formatters';
import { INftTransactionItem } from '~/layouts/Overview/components/ActivityTable/constants';
import { getNftImageUrl } from '../NftView/helpers';
import { ICollectionItem, INftMovementItem } from './constants';

export const mergeCollectionItems = (items: ICollectionItem[]) =>
  items
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

const parseCollectionList = async (collectionsList: AccountCollection[]) => {
  const parsedCollectionsList = await Promise.all(
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
  );

  return parsedCollectionsList.sort((a, b) =>
    a.ticker.name.localeCompare(b.ticker.name),
  );
};

export const parseCollectionFromPortfolio = async ({
  portfolio,
}: IPortfolioData) => {
  const collectionsList = await portfolio.getCollections();
  return parseCollectionList(collectionsList);
};

export const parseCollectionFromCollections = async (
  collectionsList: AccountCollection[],
) => {
  const parsedCollectionsList = await parseCollectionList(collectionsList);
  return mergeCollectionItems(parsedCollectionsList);
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
  return mergeCollectionItems(collections.flat());
};

const parseNftsFromCollections = async (
  collectionsList: AccountCollection[],
) => {
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

export const parseNftAssetsFromPortfolio = async ({
  portfolio,
}: IPortfolioData) => {
  const collectionsList = await portfolio.getCollections();
  return parseNftsFromCollections(collectionsList);
};

export const parseNftAssetsFromCollections = async (
  collectionsList: AccountCollection[],
) => {
  return parseNftsFromCollections(collectionsList);
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
    ({
      id,
      nftIds,
      asset,
      assetId,
      from,
      fromAccount,
      to,
      toAccount,
      createdBlock,
    }) => {
      const [paddedBlockId, paddedEventIdx] = id.split('/');

      return {
        movementId: `${removeLeadingZeros(paddedBlockId)}-${removeLeadingZeros(paddedEventIdx)}`,
        collection: hexToUuid(assetId),
        nameAndTicker: asset,
        dateTime: toParsedDateTime(createdBlock.datetime),
        from: { name: from?.name ?? null, accountAddress: fromAccount },
        to: { name: to?.name ?? null, accountAddress: toAccount },
        nftIds,
      };
    },
  ) as INftMovementItem[]) || [];

export const parseNftTransactions = (
  dataFromQuery: ITransactionsQueryResponse,
) => {
  return (
    (dataFromQuery.assetTransactions.nodes.map(
      ({
        nftIds,
        assetId,
        datetime,
        fromIdentityId,
        toIdentityId,
        createdBlock,
        extrinsicIdx,
        instructionId,
        asset,
        eventIdx,
      }) => {
        return {
          txId: {
            eventId: `${createdBlock.blockId}-${eventIdx}`,
            blockId: createdBlock.blockId.toString(),
            extrinsicIdx,
            instructionId,
          },
          dateTime: toParsedDateTime(datetime),
          from: fromIdentityId || '',
          to: toIdentityId || '',

          assetId: hexToUuid(assetId),
          nftIds,
          nameAndTicker: asset,
        };
      },
    ) as INftTransactionItem[]) || []
  );
};
