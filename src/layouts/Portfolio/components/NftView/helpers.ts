import { Nft } from '@polymeshassociation/polymesh-sdk/internal';

export const getNftImageUrl = async (nft: Nft, isTokenUri: boolean = false) => {
  let imgUrl = isTokenUri ? await nft.getTokenUri() : await nft.getImageUri();
  if (imgUrl && imgUrl?.startsWith('ipfs://')) {
    imgUrl = imgUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return imgUrl;
};

export const handleImgUrlClick = (
  e: React.MouseEvent<HTMLElement>,
  url: string,
) => {
  e.stopPropagation();
  window.open(url, '_blank');
};
