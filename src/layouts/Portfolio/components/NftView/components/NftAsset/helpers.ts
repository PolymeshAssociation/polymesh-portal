import {
  PortfolioCollection,
  CollectionKey,
} from '@polymeshassociation/polymesh-sdk/types';
import { Nft } from '@polymeshassociation/polymesh-sdk/internal';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { getNftImageUrl } from '../../helpers';
import { INftAsset } from './constants';

export const checkNftStatus = (
  collection: PortfolioCollection,
  nftId: string,
) => {
  const isLocked = collection?.locked.find(
    (nft) => nft?.id?.toString() === nftId,
  );
  if (isLocked) {
    return {
      isLocked: true,
      nft: isLocked as Nft,
    };
  }
  const isFree = collection?.free.find((nft) => nft?.id?.toString() === nftId);
  return {
    isLocked: false,
    nft: isFree as Nft,
  };
};

export const getNftCollectionAndStatus = async (
  portfolios: IPortfolioData[],
  nftCollection: string,
  nftId: string,
  portfolioId: string | null,
): Promise<{
  nft: Nft;
  collectionKeys: CollectionKey[];
  isLocked: boolean;
}> => {
  if (portfolioId) {
    const selectedPortfolio = portfolios.find(({ id }) => id === portfolioId);
    const collections = await selectedPortfolio?.portfolio.getCollections();
    const collection = collections?.find(
      ({ collection: col }) => col.ticker === nftCollection,
    );
    const collectionKeys =
      (await collection?.collection.collectionKeys()) || [];
    const nftData = checkNftStatus(collection as PortfolioCollection, nftId);
    return {
      ...nftData,
      collectionKeys,
    };
  }
  const portfolioData = await Promise.all(
    portfolios.map(async (portfolio) => {
      const collections = await portfolio?.portfolio.getCollections();
      return collections;
    }),
  );

  const collection = portfolioData
    .flat()
    .find(
      (col) =>
        col.collection?.ticker === nftCollection &&
        (col.free.some((nft) => nft.id.toString() === nftId) ||
          col.locked.some((nft) => nft.id.toString() === nftId)),
    );
  const collectionKeys = (await collection?.collection.collectionKeys()) || [];
  const nftData = checkNftStatus(collection as PortfolioCollection, nftId);
  return {
    ...nftData,
    collectionKeys,
  };
};

export const getNftDetails = async (
  nft: Nft,
  isLocked: boolean,
  collectionKeys: CollectionKey[],
): Promise<INftAsset> => {
  const imgUrl = (await getNftImageUrl(nft)) || '';
  const tokenUri = (await getNftImageUrl(nft, true)) || '';

  const parsedNft = {
    imgUrl,
    isLocked,
  } as INftAsset;

  // get off-chain args
  if (tokenUri) {
    const { body, status } = await fetch(tokenUri);
    if (body && status === 200) {
      const reader = body.pipeThrough(new TextDecoderStream()).getReader();
      const rawData = await reader?.read();
      if (rawData.value) {
        const parsedData = JSON.parse(rawData.value);
        const args = parsedData.attributes.map(
          (attr: Record<string, string>) => {
            const [metaKey, metaValue] = Object.values(attr);
            return { metaKey, metaValue };
          },
        );
        parsedNft.offChainDetails = args;
        if (parsedData.name) {
          parsedNft.name = parsedData.name;
        }
        if (parsedData.description) {
          parsedNft.description = parsedData.description;
        }
      }
    }
  }
  // get on-chain args
  if (collectionKeys?.length) {
    const nftMeta = await nft.getMetadata();
    const args = nftMeta.length
      ? nftMeta.map((meta) => {
          const metaKey = collectionKeys.find(
            (key) =>
              key.id.toNumber() === meta.key.id.toNumber() &&
              key.type === meta.key.type,
          );
          return {
            metaKey: metaKey?.name || 'key',
            metaValue: meta.value,
          };
        })
      : [];
    parsedNft.onChainDetails = args;
  }
  return parsedNft;
};

export const parseNft = async (
  portfolios: IPortfolioData[],
  nftCollection: string,
  nftId: string,
  portfolioId: string | null,
) => {
  const { nft, isLocked, collectionKeys } = await getNftCollectionAndStatus(
    portfolios,
    nftCollection,
    nftId,
    portfolioId,
  );

  const details = await getNftDetails(nft, isLocked, collectionKeys);
  return details;
};
