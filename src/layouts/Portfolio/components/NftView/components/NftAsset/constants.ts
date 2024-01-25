export enum EInfoType {
  ON_CHAIN = 'on-chain',
  OFF_CHAIN = 'off-chain',
}

export interface INftArgs {
  metaKey: string;
  metaValue: string | number | boolean;
  metaDescription?: string;
}
export interface INftAsset {
  name?: string;
  imgUrl?: string;
  tokenUri?: string;
  isLocked?: boolean;
  description?: string;
  onChainDetails?: INftArgs[];
  offChainDetails?: INftArgs[];
  ownerDid?: string;
  ownerPortfolioId?: string;
}
