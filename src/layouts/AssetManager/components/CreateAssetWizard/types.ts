import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  AddAssetRequirementParams,
  AssetDocument,
  CollectionKeyInput,
  Identity,
  KnownAssetType,
  MetadataType,
  RegisterMetadataParams,
  SecurityIdentifier,
  SetVenueFilteringParams,
  ConditionTarget,
  ConditionType,
  ClaimType,
  ScopeType,
  CountryCode,
  StatType,
  InputStatClaim,
} from '@polymeshassociation/polymesh-sdk/types';
import { Control } from 'react-hook-form';

export interface WizardStepProps {
  defaultValues: WizardData;
  onComplete: (data: Partial<WizardData>) => void;
  onBack: () => void;
  nextAssetId: string;
  isFinalStep: boolean;
  setAssetData?: React.Dispatch<React.SetStateAction<WizardData>>;
}

export interface RuleProps {
  control: Control<WizardData>;
  baseName: `complianceRules.${number}.conditions`;
  nextAssetId: string;
}

export type TransferRestrictionInput =
  | {
      type: StatType.Count | StatType.Balance;
      max: BigNumber;
      exemptedIdentities: string[];
    }
  | {
      type: StatType.ScopedCount | StatType.ScopedBalance;
      issuer: string;
      claimType: InputStatClaim;
      max: BigNumber;
      min: BigNumber;
      exemptedIdentities: string[];
    };

export interface WizardData {
  fungibility: string;
  assetType: string;
  customAssetType?: string;
  name: string;
  ticker?: string;
  isDivisible: boolean;
  fundingRound?: string;
  securityIdentifiers: SecurityIdentifier[];
  documents: AssetDocument[];
  metadata: (RegisterMetadataParams & { id?: number; type: MetadataType })[];
  // claimIssuers: InputTrustedClaimIssuer[];
  claimIssuers: {
    identity: string;
    trustedFor:
      | (ClaimType | { type: ClaimType.Custom; customClaimTypeId: BigNumber })[]
      | null;
  }[];
  complianceRules: AddAssetRequirementParams[];
  initialSupply?: BigNumber;
  portfolioId?: BigNumber;
  collectionKeys: CollectionKeyInput[];
  requiredMediators: string[];
  venueRestrictions: SetVenueFilteringParams;
  transferRestrictions: TransferRestrictionInput[];
}

export const initialWizardData: WizardData = {
  fungibility: 'fungible',
  assetType: KnownAssetType.EquityCommon,
  name: '',
  ticker: '',
  isDivisible: false,
  fundingRound: '',
  securityIdentifiers: [],
  documents: [],
  metadata: [],
  claimIssuers: [],
  complianceRules: [],
  initialSupply: undefined,
  portfolioId: undefined,
  collectionKeys: [],
  requiredMediators: [],
  venueRestrictions: {
    allowedVenues: [],
    enabled: false,
  },
  transferRestrictions: [],
};

/**
 * A flattened interface showing all possible properties of an InputCondition
 * Properties are marked as optional if they only exist in certain condition types
 */
export interface InputConditionStructure {
  // Common properties for all conditions
  type: ConditionType;
  target: ConditionTarget;
  trustedClaimIssuers?: Array<{
    identity: string | Identity;
    trustedFor: ClaimType[] | null;
  }>;

  // Properties for IsIdentity condition
  identity?: string | Identity;

  // Properties for IsPresent/IsAbsent conditions
  claim?: {
    type: ClaimType;
    // For Jurisdiction claims
    code?: CountryCode;
    // For Custom claims
    customClaimTypeId?: BigNumber;
    // For scoped claims
    scope?: {
      type: ScopeType;
      value: string;
    };
  };

  // Properties for IsAnyOf/IsNoneOf conditions
  claims?: Array<{
    type: ClaimType;
    // For Jurisdiction claims
    code?: CountryCode;
    // For Custom claims
    customClaimTypeId?: BigNumber;
    // For scoped claims
    scope?: {
      type: ScopeType;
      value: string;
    };
  }>;
}

/**
 * Individual typed interfaces for each condition type
 */
export interface BaseCondition {
  target: ConditionTarget;
  trustedClaimIssuers?: Array<{
    identity: string | Identity;
    trustedFor: ClaimType[] | null;
  }>;
}

export interface ExternalAgentCondition extends BaseCondition {
  type: ConditionType.IsExternalAgent;
}

export interface IdentityCondition extends BaseCondition {
  type: ConditionType.IsIdentity;
  identity: string | Identity;
}

export interface ClaimScope {
  type: ScopeType;
  value: string;
}

export interface BaseClaim {
  type: ClaimType;
  scope?: ClaimScope;
}

export interface JurisdictionClaim extends BaseClaim {
  type: ClaimType.Jurisdiction;
  code: CountryCode;
}

export interface CustomClaim extends BaseClaim {
  type: ClaimType.Custom;
  customClaimTypeId: BigNumber;
}

export interface SingleClaimCondition extends BaseCondition {
  type: ConditionType.IsPresent | ConditionType.IsAbsent;
  claim: BaseClaim | JurisdictionClaim | CustomClaim;
}

export interface MultiClaimCondition extends BaseCondition {
  type: ConditionType.IsAnyOf | ConditionType.IsNoneOf;
  claims: Array<BaseClaim | JurisdictionClaim | CustomClaim>;
}

export type TypedInputCondition =
  | ExternalAgentCondition
  | IdentityCondition
  | SingleClaimCondition
  | MultiClaimCondition;

/**
 * Usage example for each condition type:
 *
 * IsExternalAgent:
 * {
 *   type: ConditionType.IsExternalAgent,
 *   target: ConditionTarget.Both
 * }
 *
 * IsIdentity:
 * {
 *   type: ConditionType.IsIdentity,
 *   target: ConditionTarget.Both,
 *   identity: "0x123..." || identityInstance
 * }
 *
 * IsPresent/IsAbsent:
 * {
 *   type: ConditionType.IsPresent,
 *   target: ConditionTarget.Both,
 *   claim: {
 *     type: ClaimType.Jurisdiction,
 *     code: CountryCode.Ca,
 *     scope: {
 *       type: ScopeType.Identity,
 *       value: "0x123..."
 *     }
 *   }
 * }
 *
 * IsAnyOf/IsNoneOf:
 * {
 *   type: ConditionType.IsAnyOf,
 *   target: ConditionTarget.Both,
 *   claims: [{
 *     type: ClaimType.Jurisdiction,
 *     code: CountryCode.Ca,
 *     scope: {
 *       type: ScopeType.Identity,
 *       value: "0x123..."
 *     }
 *   }]
 * }
 */
