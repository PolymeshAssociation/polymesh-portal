import { Nft } from '@polymeshassociation/polymesh-sdk/types';
import { asUuid } from '@polymeshassociation/polymesh-sdk/utils/internal';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { getNftImageUrl } from '../../helpers';

const parseSingleNftFromPortfolio = async (nft: Nft, isLocked: boolean) => {
  const imgUrl = await getNftImageUrl(nft);
  return {
    ticker: {
      imgUrl: imgUrl || '',
    },
    id: nft.id.toNumber(),
    isLocked,
  };
};

export const parseCollectionFromPortfolio = async (
  { portfolio }: IPortfolioData,
  nftCollection: string,
) => {
  const collectionsList = await portfolio.getCollections();
  const currectCollection = collectionsList.find(
    ({ collection }) => collection.id === asUuid(nftCollection),
  );

  if (!currectCollection) {
    return [];
  }
  const freeNfts = await Promise.all(
    currectCollection.free.map(async (nft) => {
      const parsedNft = await parseSingleNftFromPortfolio(nft, false);
      return parsedNft;
    }),
  );

  const lockedNfts = await Promise.all(
    currectCollection.locked.map(async (nft) => {
      const parsedNft = await parseSingleNftFromPortfolio(nft, true);
      return parsedNft;
    }),
  );

  return [freeNfts, lockedNfts].flat(3);
};

export const parseCollectionFromPortfolios = async (
  portfolios: IPortfolioData[],
  nftCollection: string,
) => {
  const data = await Promise.all(
    portfolios.map(async (portfolio) => {
      const parsedPortfolio = await parseCollectionFromPortfolio(
        portfolio,
        nftCollection,
      );
      return parsedPortfolio;
    }),
  );
  return data.flat();
};
