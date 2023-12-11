import { AssetDocument } from '@polymeshassociation/polymesh-sdk/types';

export interface ICollectionDetails {
  collectionId: number;
  createdAt: string;
  assetType: string;
  name: string;
  owner: string;
  totalSupply: number;
  docs?: AssetDocument[];
  expiry?: string;
  lockedState?: string;
  value?: string;
  description?: string;
}