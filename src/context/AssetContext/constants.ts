import {
  ActiveTransferRestrictions,
  AgentWithGroup,
  Asset,
  AssetDetails,
  AssetDocument,
  CollectionKey,
  ComplianceRequirements,
  GlobalMetadataKey,
  PermissionGroups,
  SecurityIdentifier,
  TickerReservation,
  TickerReservationDetails,
  TransferRestrictionStatValues,
  Venue,
} from '@polymeshassociation/polymesh-sdk/types';

export interface IAssetMeta {
  name: string;
  description?: string;
  expiry?: Date | string | null;
  isLocked?: string | null;
  lockedUntil?: string;
  value?: string | null;
}

export interface IDetails {
  assetIdentifiers: SecurityIdentifier[];
  assetType: string;
  collectionKeys: CollectionKey[];
  createdAt: Date | null;
  fundingRound: string | null;
  holderCount: number;
  isDivisible: boolean;
  isNftCollection: boolean;
  metaData: IAssetMeta[];
  name: string;
  owner: string;
  ticker?: string;
  totalSupply: number;
  collectionId?: number;
  requiredMediators: string[];
  venueFilteringEnabled: boolean;
  permittedVenuesIds: string[];
  permittedVenues: Venue[];
  isFrozen: boolean;
  agentsWithGroups?: AgentWithGroup[];
  permissionGroups?: PermissionGroups;
  complianceRequirements?: ComplianceRequirements;
  compliancePaused: boolean;
  transferRestrictions?: ActiveTransferRestrictions;
  trackedStatistics?: TransferRestrictionStatValues[];
}
export interface IAssetDetails {
  assetId: string;
  details?: IDetails;
  docs?: AssetDocument[];
}

export type AssetWithDetails = Asset & AssetDetails;

export type TickerReservationWithDetails = TickerReservation &
  TickerReservationDetails;

export interface IAssetContext {
  ownedAssets: AssetWithDetails[];
  managedAssets: AssetWithDetails[];
  assetsLoading: boolean;
  setOwnedAssets: (assets: AssetWithDetails[]) => void;
  refreshAssets: () => void;
  tickerReservations: TickerReservationWithDetails[];
  fetchAssetDetails: (
    assetIdentifier: string | Asset,
    forceRefresh?: boolean,
  ) => Promise<IAssetDetails | undefined>;
  fetchAsset: (assetIdentifier: string) => Promise<Asset | undefined>;
  globalMetadata: GlobalMetadataKey[];
  refreshGlobalMetadata: () => void;
}

export const initialAssetContext: IAssetContext = {
  ownedAssets: [],
  managedAssets: [],
  assetsLoading: false,
  setOwnedAssets: () => {},
  refreshAssets: () => {},
  tickerReservations: [],
  fetchAssetDetails: async () => undefined,
  fetchAsset: async () => undefined,
  globalMetadata: [],
  refreshGlobalMetadata: () => {},
};
