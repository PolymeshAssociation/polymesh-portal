export enum EInfoType {
  ON_CHAIN = 'on-chain',
  OFF_CHAIN = 'off-chain'
}

export interface INftArgs {
  metaKey: string;
  metaValue: string;
}
export interface INftAsset {
  name?: string;
  imgUrl?: string;
  isLocked?: boolean;
  description?: string;
  onChainDetails?: INftArgs[];
  offChainDetails?: INftArgs[];
}
