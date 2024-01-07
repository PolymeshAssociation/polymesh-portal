import { Nft } from '@polymeshassociation/polymesh-sdk/internal';

export const convertIpfsLink = (uri: string): string => {
  return uri.startsWith('ipfs://')
    ? uri.replace('ipfs://', 'https://ipfs.io/ipfs/')
    : uri;
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
  nftOffchainMetadata?: { image: string | null },
): Promise<string | null> => {
  let imageUri = await nft.getImageUri();
  if (!imageUri) {
    if (!nftOffchainMetadata) {
      imageUri = await getExternalNftImageUrl(nft);
    } else {
      imageUri = nftOffchainMetadata.image;
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
