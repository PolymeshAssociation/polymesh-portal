import { Nft } from '@polymeshassociation/polymesh-sdk/internal';
import { convertIpfsLink } from '~/helpers/security';

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

  try {
    const parsedData = JSON.parse(rawData);
    return parsedData.image ? convertIpfsLink(parsedData.image) : null;
  } catch {
    // Invalid JSON from external source
    return null;
  }
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
