import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { toParsedDateTime } from '~/helpers/dateTime';
import { parseSingleNftFromPortfolio } from '../../../NftAssetTable/helpers';

export const parseCollectionFromPortfolio = async (
  { portfolio }: IPortfolioData,
  nftCollection: string,
) => {
  const collectionsList = await portfolio.getCollections();
  const currectCollection = collectionsList.find(
    ({ collection }) => collection.ticker === nftCollection,
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

export const getDateTime = (dateTime: string | Date) => {
  const [date, time] = toParsedDateTime(dateTime).split(' ');
  return `${date} / ${time}`;
};
