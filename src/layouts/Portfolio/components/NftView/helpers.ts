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
  const response = await fetch(tokenUri);
  if (!response.ok) {
    return null;
  }

  const rawData = await response.text();
  const parsedData = JSON.parse(rawData);
  return parsedData.image ? convertIpfsLink(parsedData.image) : null;
};

export const getNftImageUrl = async (
  nft: Nft,
  image?: string | null,
): Promise<string | null> => {
  let imageUri = await nft.getImageUri();
  if (!imageUri) {
    imageUri = image || (await getExternalNftImageUrl(nft));
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
