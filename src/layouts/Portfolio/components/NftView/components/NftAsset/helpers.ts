import { CollectionKey } from '@polymeshassociation/polymesh-sdk/types';
import { Nft } from '@polymeshassociation/polymesh-sdk/internal';
import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import { PolymeshPrimitivesIdentityIdPortfolioId } from '@polymeshassociation/polymesh-sdk/polkadot/types-lookup';
import { getNftImageUrl, getNftTokenUri } from '../../helpers';
import { INftAsset } from './constants';
import { padTicker } from '~/helpers/formatters';
import { notifyWarning } from '~/helpers/notifications';

export const getNftCollectionAndStatus = async (
  nftCollection: string,
  nftId: string,
  portfolioId: string | null,
  did: string | undefined,
  sdk: Polymesh,
  polkadotApi: Polymesh['_polkadotApi'],
): Promise<{
  nft: Nft;
  collectionKeys: CollectionKey[];
  isLocked: boolean;
  ownerDid: string;
  ownerPortfolioId: string;
}> => {
  const collection = await sdk.assets.getNftCollection({
    ticker: nftCollection,
  });
  // The polkadot api requires tickers to be exactly 12 characters long.
  // Pad ticker with null characters to the required length.
  const paddedTicker = padTicker(nftCollection);

  const collectionKeys = (await collection.collectionKeys()) || [];
  const nft = await collection.getNft({ id: new BigNumber(nftId) });
  const optionOwner = await polkadotApi.query.nft.nftOwner(paddedTicker, nftId);

  if (optionOwner.isNone) {
    throw new Error(
      `Owner not found for ${nftCollection} token ID ${nftId}. The token may have been redeemed`,
    );
  }

  const owner =
    // TODO remove type casting once SDK is updated with latest generated types
    optionOwner.unwrap() as unknown as PolymeshPrimitivesIdentityIdPortfolioId;

  const ownerDid = owner.did.toString();
  const ownerPortfolioId = owner.kind.isDefault
    ? 'default'
    : owner.kind.asUser.toString();

  if (ownerDid !== did) {
    notifyWarning(
      `NFT ID ${nftId} of collection ${nftCollection} is not owned by the selected identity`,
    );
  }

  if (portfolioId) {
    const inPortfolio = await polkadotApi.query.portfolio.portfolioNFT(
      {
        did,
        kind:
          portfolioId === 'default' ? { default: null } : { user: portfolioId },
      },
      [paddedTicker, nftId],
    );

    if (inPortfolio.isFalse) {
      notifyWarning(
        `NFT ID ${nftId} of collection ${nftCollection} not found in Portfolio ID ${portfolioId}`,
      );
    }
  }

  const isLocked = await polkadotApi.query.portfolio.portfolioLockedNFT(owner, [
    paddedTicker,
    nftId,
  ]);

  return {
    nft,
    collectionKeys,
    isLocked: isLocked.isTrue,
    ownerDid,
    ownerPortfolioId,
  };
};

export const getNftDetails = async (
  nft: Nft,
  isLocked: boolean,
  collectionKeys: CollectionKey[],
  ownerDid: string,
  ownerPortfolioId: string,
): Promise<INftAsset> => {
  const tokenUri = (await getNftTokenUri(nft)) || '';

  const parsedNft = {
    tokenUri,
    isLocked,
    ownerDid,
    ownerPortfolioId,
  } as INftAsset;

  // get off-chain args
  if (tokenUri) {
    const { body, status } = await fetch(tokenUri);
    if (body && status === 200) {
      const reader = body.pipeThrough(new TextDecoderStream()).getReader();
      const rawData = await reader?.read();
      if (rawData.value) {
        const parsedData = JSON.parse(rawData.value);
        parsedNft.imgUrl = (await getNftImageUrl(nft, parsedData)) || '';

        if (parsedData.attributes) {
          const attributes = parsedData.attributes.map(
            (attr: { trait_type?: string; value?: string | number }) => {
              const { trait_type: metaKey, value: metaValue } = attr;
              return { metaKey, metaValue };
            },
          );
          parsedNft.offChainDetails = attributes;
        }
        if (parsedData.name) {
          parsedNft.name = parsedData.name;
        }
        if (parsedData.description) {
          parsedNft.description = parsedData.description;
        }
      }
    }
  } else {
    parsedNft.imgUrl = (await getNftImageUrl(nft)) || '';
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
            metaDescription: metaKey?.specs.description,
          };
        })
      : [];
    parsedNft.onChainDetails = args;
  }

  return parsedNft;
};
