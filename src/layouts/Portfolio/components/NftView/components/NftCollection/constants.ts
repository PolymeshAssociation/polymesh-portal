import { AssetDocument } from '@polymeshassociation/polymesh-sdk/types';

export interface ICollectionMeta {
  name?: string;
  description?: string;
  expiry?: string | null;
  isLocked?: string | null;
  value?: string | null;
}

export interface ICollectionDetails {
  collectionId: number;
  createdAt: string;
  assetType: string;
  name: string;
  owner: string;
  totalSupply: number;
  docs?: AssetDocument[];
  metaData?: ICollectionMeta[]
}