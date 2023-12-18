import { AssetDocument } from '@polymeshassociation/polymesh-sdk/types';

export interface IAssetMeta {
  name?: string;
  description?: string;
  expiry?: Date | string | null;
  isLocked?: string | null;
  value?: string | null;
}

export interface IAssetDetails {
  id: number | string;
  details: {
    createdAt: string;
    assetType: string;
    name: string;
    owner: string;
    totalSupply: number;
    metaData?: IAssetMeta[];
  }
  docs?: AssetDocument[];
}