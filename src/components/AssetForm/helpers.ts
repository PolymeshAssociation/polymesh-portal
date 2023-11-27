import {
  DefaultPortfolio,
  NumberedPortfolio,
  Nft
} from '@polymeshassociation/polymesh-sdk/types';
import {
  ICombinedPortfolioData,
  IPortfolioData,
} from '~/context/PortfolioContext/constants';
import { getNftImageUrl } from '~/layouts/Portfolio/components/NftView/helpers';
import { INft, IParsedCollectionData } from './constants';

export const parseCollectionsFromSinglePortfolio = async (
  portfolio: DefaultPortfolio | NumberedPortfolio,
): Promise<IParsedCollectionData> => {
  let nfts = {} as Record<string, INft[]>;
  const collectionList = await portfolio.getCollections();
  const parsedList = await Promise.all(
    collectionList.map(async ({ collection, free }) => {
      const parsedNfts = await parseNftsFromCollection(free);
      nfts[collection.ticker] = parsedNfts;
      const { name, } = await collection.details();
      return {
        ticker: collection.ticker,
        name,
      };
    }),
  );

  const collections = parsedList.reduce((acc, item) => ({
    ...acc,
    [item.ticker]: item
  }), {})

  return { collections, nfts };
};

export const parseCollectionsFromCombinedPortfolio = async (
  portfolios: (DefaultPortfolio | NumberedPortfolio)[],
) => {
  const data = await Promise.all(portfolios.map(async(portfolio) => {
    const parsedPortfolio = await parseCollectionsFromSinglePortfolio(portfolio);
    return parsedPortfolio;
  }));

  const parsedData = data.reduce((acc, elem) => {
    const nftCollection = Object.keys(elem.nfts).reduce((nftAcc, nft) => {
      if (Object.keys(nftAcc).includes(nft)) {
        return {
          ...nftAcc,
          [nft]: [...nftAcc[nft], ...elem.nfts[nft]]
        };
      }
      return {
        ...nftAcc,
        [nft]: elem.nfts[nft]
      };
    }, acc.nfts);

    return {
      collections: {...acc.collections, ...elem.collections },
      nfts: nftCollection
    }
  }, {collections: {}, nfts: {}} as IParsedCollectionData)

  return parsedData;
};

export const parseCollections = async (portfolio: ICombinedPortfolioData | IPortfolioData) => {
  const parsedList = Array.isArray(portfolio.portfolio)
    ? await parseCollectionsFromCombinedPortfolio(
        portfolio.portfolio as (DefaultPortfolio | NumberedPortfolio)[],
      )
    : await parseCollectionsFromSinglePortfolio(
        portfolio.portfolio as DefaultPortfolio | NumberedPortfolio,
      );
  return parsedList;
}

export const parseNftsFromCollection = async (nfts: Nft[]) => {
  if (!nfts.length) return [];
  const parsedNfts = await Promise.all(nfts.map(async (nft) => {
      const imgUrl = (await getNftImageUrl(nft)) || '';
      return {
        id: nft.id,
        imgUrl,
      };
    }),
  );
  return parsedNfts;
};
