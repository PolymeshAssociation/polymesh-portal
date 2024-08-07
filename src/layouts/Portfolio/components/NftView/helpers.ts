import { Nft } from '@polymeshassociation/polymesh-sdk/internal';
import { IPFS_PROVIDER_URL } from '~/context/PolymeshContext/constants';

export const convertIpfsLink = (uri: string): string => {
  const rawIpfsUrl: string =
    JSON.parse(localStorage.getItem('ipfsProviderUrl') || '') ||
    IPFS_PROVIDER_URL;
  const ipfsUrl =
    rawIpfsUrl.charAt(rawIpfsUrl.length - 1) === '/'
      ? rawIpfsUrl
      : `${rawIpfsUrl}/`;

  return uri.startsWith('ipfs://') ? `${uri.replace('ipfs://', ipfsUrl)}` : uri;
};

export const getNftTokenUri = async (nft: Nft): Promise<string | null> => {
  const tokenUri = await nft.getTokenUri();
  return tokenUri ? convertIpfsLink(tokenUri) : null;
};

export const getExternalNftImageUrl = async (
  nft: Nft,
): Promise<string | null> => {
  const tokenUri = await getNftTokenUri(nft);
  if (!tokenUri) {
    return null;
  }
  const { body, status } = await fetch(tokenUri);
  if (!body || status !== 200) {
    return null;
  }
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  const rawData = await reader?.read();
  if (!rawData.value) {
    return null;
  }
  const parsedData = JSON.parse(rawData.value);

  if (!parsedData.image) {
    return null;
  }

  return convertIpfsLink(parsedData.image);
};

export const getNftImageUrl = async (
  nft: Nft,
  image?: string | null,
): Promise<string | null> => {
  let imageUri = await nft.getImageUri();
  if (!imageUri) {
    if (!image) {
      imageUri = await getExternalNftImageUrl(nft);
    } else {
      imageUri = image;
    }
  }
  return imageUri ? convertIpfsLink(imageUri) : null;
};

export const handleImgUrlClick = (
  e: React.MouseEvent<HTMLElement>,
  url: string,
) => {
  e.stopPropagation();
  window.open(url, '_blank');
};
