import {
  ActiveTransferRestrictions,
  AgentWithGroup,
  Asset,
  AssetDetails,
  AssetDocumentWithId,
  CollectionKey,
  ComplianceRequirements,
  GlobalMetadataKey,
  MetadataDetails,
  MetadataEntry,
  MetadataLockStatus,
  PermissionGroups,
  SecurityIdentifier,
  TickerReservation,
  TickerReservationDetails,
  TransferRestrictionExemption,
  TransferRestrictionStatValues,
  Venue,
} from '@polymeshassociation/polymesh-sdk/types';

/**
 * Metadata entry with details and optional value information.
 */
export interface AssetMetadata {
  entry: MetadataEntry;
  details: MetadataDetails;
  value?: string;
  lockStatus?: MetadataLockStatus;
  lockedUntil?: Date;
  expiry?: Date | null;
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
  metadata: AssetMetadata[];
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
  exemptions?: TransferRestrictionExemption[];
}
export interface IAssetDetails {
  assetId: string;
  details?: IDetails;
  docs?: AssetDocumentWithId[];
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
