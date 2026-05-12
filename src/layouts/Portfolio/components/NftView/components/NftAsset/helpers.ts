import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import { Nft } from '@polymeshassociation/polymesh-sdk/internal';
import {
  CollectionKey,
  NftCollection,
} from '@polymeshassociation/polymesh-sdk/types';
import { notifyWarning } from '~/helpers/notifications';
import { getNftImageUrl, getNftTokenUri } from '../../helpers';
import { INftAsset } from './constants';

export const getNftCollectionAndStatus = async (
  nftCollectionIdentifier: NftCollection | string,
  nftId: string,
  portfolioId: string | null,
  did: string | undefined,
  sdk: Polymesh,
  accountAddress?: string | null,
): Promise<{
  nft: Nft;
  collectionKeys: CollectionKey[];
  isLocked: boolean;
  ownerDid?: string;
  ownerAddress?: string;
  ownerPortfolioId?: string;
}> => {
  let collection: NftCollection;
  if (typeof nftCollectionIdentifier === 'string') {
    if (nftCollectionIdentifier.length <= 12) {
      collection = await sdk.assets.getNftCollection({
        ticker: nftCollectionIdentifier,
      });
    } else {
      collection = await sdk.assets.getNftCollection({
        assetId: nftCollectionIdentifier,
      });
    }
  } else {
    collection = nftCollectionIdentifier;
  }

  const collectionKeys = (await collection.collectionKeys()) || [];
  const nft = await collection.getNft({ id: new BigNumber(nftId) });
  const ownerHolder = await nft.getOwner();

  if (!ownerHolder) {
    throw new Error(
      `Owner not found for ${collection.id} token ID ${nftId}. The token may have been redeemed`,
    );
  }

  const isPortfolioOwned = 'owner' in ownerHolder;

  // Resolve ownership details for both cases
  let ownerDid: string | undefined;
  let ownerAddress: string | undefined;
  let ownerPortfolioId: string | undefined;

  if (isPortfolioOwned) {
    ownerDid = ownerHolder.owner.did;
    ownerPortfolioId =
      'id' in ownerHolder ? ownerHolder.id.toString() : 'default';
  } else {
    ownerAddress = ownerHolder.address.toString();
    const ownerIdentity = await ownerHolder.getIdentity();
    ownerDid = ownerIdentity?.did;
  }

  // Warn if the NFT is not owned by the expected identity
  if (ownerDid !== did) {
    notifyWarning(
      `NFT ID ${nftId} of collection ${collection.id} is not owned by the selected identity`,
    );
  }

  // Warn if a portfolio was selected but the NFT is not held in the expected portfolio
  if (portfolioId) {
    if (!isPortfolioOwned) {
      notifyWarning(
        `NFT ID ${nftId} of collection ${collection.id} is not held in a portfolio`,
      );
    } else if (ownerPortfolioId !== portfolioId) {
      notifyWarning(
        `NFT ID ${nftId} of collection ${collection.id} not found in Portfolio ID ${portfolioId}`,
      );
    }
  }

  // Warn if an account was selected but the NFT is not directly owned by that account
  if (accountAddress) {
    if (isPortfolioOwned) {
      notifyWarning(
        `NFT ID ${nftId} of collection ${collection.id} is not directly owned by an account`,
      );
    } else if (ownerAddress !== accountAddress) {
      notifyWarning(
        `NFT ID ${nftId} of collection ${collection.id} is not owned by the selected account`,
      );
    }
  }

  const isLocked = await nft.isLocked();
  return {
    nft,
    collectionKeys,
    isLocked,
    ownerDid,
    ownerAddress,
    ownerPortfolioId,
  };
};

function processProperty(attr: {
  trait_type?: string;
  value?: string | number | boolean;
}): {
  metaKey: string;
  metaValue: string | number | boolean;
} {
  const { trait_type: metaKey, value: metaValue } = attr;

  if (!metaKey || metaValue === undefined || metaValue === null) {
    return {
      metaKey: metaKey || 'unknown property',
      metaValue: typeof attr === 'object' ? JSON.stringify(attr) : attr,
    };
  }
  if (typeof metaValue === 'object') {
    return { metaKey, metaValue: JSON.stringify(metaValue) };
  }
  return { metaKey, metaValue };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processProperties(data: any[] | Record<string, any> | undefined): {
  metaKey: string;
  metaValue: string | number | boolean;
}[] {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data.map((attr) => processProperty(attr));
  }
  if (typeof data === 'object') {
    return Object.entries(data).map(([key, value]) => {
      return processProperty({ trait_type: key, value });
    });
  }

  return [];
}

export const getNftDetails = async (
  nft: Nft,
  isLocked: boolean,
  collectionKeys: CollectionKey[],
  ownerDid?: string,
  ownerPortfolioId?: string,
  ownerAddress?: string,
): Promise<INftAsset> => {
  const tokenUri = (await getNftTokenUri(nft)) || '';

  const parsedNft = {
    tokenUri,
    isLocked,
    ownerDid,
    ownerAddress,
    ownerPortfolioId,
  } as INftAsset;

  // get off-chain args
  if (tokenUri) {
    const { body, status } = await fetch(tokenUri);
    if (body && status === 200) {
      const reader = body.pipeThrough(new TextDecoderStream()).getReader();
      const rawData = await reader?.read();
      if (rawData.value) {
        try {
          const parsedData = JSON.parse(rawData.value);
          const {
            image: imageUri,
            attributes: rawAttributes,
            properties: rawProperties,
            name: rawName,
            description: rawDescription,
            ...rawOtherProperties
          } = parsedData;

          parsedNft.imgUrl = (await getNftImageUrl(nft, imageUri)) || '';

          if (rawAttributes) {
            const attributes = processProperties(rawAttributes);
            parsedNft.offChainDetails = parsedNft.offChainDetails
              ? parsedNft.offChainDetails.concat(attributes)
              : attributes;
          }

          if (rawProperties) {
            const properties = processProperties(rawProperties);
            parsedNft.offChainDetails = parsedNft.offChainDetails
              ? parsedNft.offChainDetails.concat(properties)
              : properties;
          }

          if (rawOtherProperties) {
            const otherProperties = processProperties(rawOtherProperties);
            parsedNft.offChainDetails = parsedNft.offChainDetails
              ? parsedNft.offChainDetails.concat(otherProperties)
              : otherProperties;
          }

          if (rawName) {
            parsedNft.name = rawName;
          }
          if (rawDescription) {
            parsedNft.description = rawDescription;
          }
        } catch {
          // Invalid JSON from external source, skip off-chain metadata
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
