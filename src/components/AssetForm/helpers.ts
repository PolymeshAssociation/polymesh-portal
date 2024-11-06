import {
  DefaultPortfolio,
  NumberedPortfolio,
  Nft,
  NftCollection,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  ICombinedPortfolioData,
  IPortfolioData,
} from '~/context/PortfolioContext/constants';
import { getNftImageUrl } from '~/layouts/Portfolio/components/NftView/helpers';
import { INft, IParsedCollectionData } from './constants';

export const parseNftsFromCollection = async (
  freeNfts: Nft[],
  lockedNfts: Nft[],
) => {
  const allNfts = [
    ...freeNfts.map((nft) => ({ nft, locked: false })),
    ...lockedNfts.map((nft) => ({ nft, locked: true })),
  ];

  if (!allNfts.length) return [];

  const parsedNfts = await Promise.all(
    allNfts.map(async ({ nft, locked }) => {
      const imgUrl = (await getNftImageUrl(nft)) || '';
      return {
        id: nft.id,
        imgUrl,
        locked,
      };
    }),
  );

  return parsedNfts;
};

export const parseCollectionsFromSinglePortfolio = async (
  portfolio: DefaultPortfolio | NumberedPortfolio,
): Promise<IParsedCollectionData> => {
  const nfts = {} as Record<string, INft[]>;
  const collectionList = await portfolio.getCollections();
  const collections = await Promise.all(
    collectionList.map(async ({ collection, free, locked }) => {
      const parsedNfts = await parseNftsFromCollection(free, locked);
      nfts[collection.id] = parsedNfts;
      return collection;
    }),
  );

  return { collections, nfts };
};

export const parseCollectionsFromCombinedPortfolio = async (
  portfolios: (DefaultPortfolio | NumberedPortfolio)[],
) => {
  const data = await Promise.all(
    portfolios.map(parseCollectionsFromSinglePortfolio),
  );

  const collectionMap = new Map<string, NftCollection>();
  const nftRecord: Record<string, INft[]> = {};

  data.forEach((elem) => {
    // Accumulate unique collections by ID
    elem.collections.forEach((collection) => {
      collectionMap.set(collection.id, collection);
    });

    // Accumulate NFTs by collection ID
    Object.entries(elem.nfts).forEach(([collectionId, nfts]) => {
      if (!nftRecord[collectionId]) {
        nftRecord[collectionId] = [];
      }
      nftRecord[collectionId].push(...nfts);
    });
  });

  return {
    collections: Array.from(collectionMap.values()),
    nfts: nftRecord,
  } as IParsedCollectionData;
};

export const parseCollections = async (
  portfolio: ICombinedPortfolioData | IPortfolioData,
) => {
  const parsedList = Array.isArray(portfolio.portfolio)
    ? await parseCollectionsFromCombinedPortfolio(
        portfolio.portfolio as (DefaultPortfolio | NumberedPortfolio)[],
      )
    : await parseCollectionsFromSinglePortfolio(
        portfolio.portfolio as DefaultPortfolio | NumberedPortfolio,
      );
  return parsedList;
};
