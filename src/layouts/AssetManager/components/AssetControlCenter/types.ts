// TypeScript interfaces for Asset Control Center components

import { Asset } from '@polymeshassociation/polymesh-sdk/types';
import { IAssetDetails } from '~/context/AssetContext/constants';

// Asset Snapshot props
export interface AssetSnapshotProps {
  asset: IAssetDetails;
  assetInstance?: Asset;
  onRefresh: () => void | Promise<void>;
  isLoading?: boolean;
}

// Tab Container props
export interface AssetTabsContainerProps {
  asset: IAssetDetails;
}

// Tab component props
export interface TabProps {
  asset: IAssetDetails;
}

// Security Identifier data structure
export interface SecurityIdentifier {
  id: string;
  type: string;
  value: string;
}

// Asset Document data structure
export interface AssetDocument {
  id: string;
  name: string;
  type: string;
  contentHash?: string;
  filedAt: Date;
  uri?: string;
}

// Asset Metadata data structure
export interface AssetMetadata {
  id: string;
  key: string;
  value: string;
  details?: string;
  locked?: boolean;
  lockStatus?: string | null; // Full lock status ("Locked", "Locked Until", etc.)
  lockedUntil?: string; // Formatted timestamp for "Locked Until"
  expiry?: string | null; // Expiry date if any
}

// Venue Configuration data structure
export interface VenueConfig {
  isEnabled: boolean;
  allowedVenues: string[];
}

// Required Mediator data structure
export interface RequiredMediator {
  id: string; // Identity DID
}

// Trusted Claim Issuer data structure
export interface TrustedClaimIssuer {
  id: string; // Identity DID
  trustedFor: string[] | null; // Array of ClaimType strings, or null for "trusted for all"
}

// Transfer Restriction data structures - based on Polymesh SDK types
// These match the exact SDK interface structures
export interface TransferRestrictionCount {
  count: string; // BigNumber as string
  exemptedIds?: string[];
}

export interface TransferRestrictionPercentage {
  percentage: string; // BigNumber as string
  exemptedIds?: string[];
}

export interface TransferRestrictionClaimCount {
  claim: {
    type: string; // ClaimType enum value (e.g., "Accredited", "Affiliate", "Jurisdiction", etc.)
    [key: string]: unknown; // Additional claim properties
  };
  issuer: string; // Identity DID
  min: string; // BigNumber as string
  max?: string; // BigNumber as string
  exemptedIds?: string[];
}

export interface TransferRestrictionClaimPercentage {
  claim: {
    type: string; // ClaimType enum value (e.g., "Accredited", "Affiliate", "Jurisdiction", etc.)
    [key: string]: unknown; // Additional claim properties
  };
  issuer: string; // Identity DID
  min: string; // BigNumber as string
  max: string; // BigNumber as string
  exemptedIds?: string[];
}

export type TransferRestriction =
  | TransferRestrictionCount
  | TransferRestrictionPercentage
  | TransferRestrictionClaimCount
  | TransferRestrictionClaimPercentage;

// Permission Group Management interfaces - matching SDK structure
export interface IPermissionGroupPermissions {
  transactions?: {
    type: 'Include' | 'Exclude';
    values: string[];
  } | null;
  transactionGroups?: string[] | null;
}

export interface IPermissionGroup {
  id: string | number;
  type: 'known' | 'custom';
  name: string;
  agentCount: number;
  permissions?: IPermissionGroupPermissions;
}
