import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  AssetDocument,
  ClaimType,
  CollectionKeyInput,
  ConditionTarget,
  ConditionType,
  CountryCode,
  InputStatClaim,
  InputTrustedClaimIssuer,
  KnownAssetType,
  MetadataType,
  RegisterMetadataParams,
  ScopeType,
  SecurityIdentifier,
  SetAssetRequirementsParams,
  SetVenueFilteringParams,
  StatType,
  TrustedFor,
} from '@polymeshassociation/polymesh-sdk/types';

export interface WizardStepProps {
  defaultValues: WizardData;
  onComplete: (data: Partial<WizardData>) => void;
  onBack: () => void;
  nextAssetId: string;
  isFinalStep: boolean;
  setAssetData?: React.Dispatch<React.SetStateAction<WizardData>>;
  isLoading?: boolean;
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
  claimIssuers: {
    identity: string;
    trustedFor: TrustedFor[] | null;
  }[];
  complianceRules: SetAssetRequirementsParams;
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
  complianceRules: {
    requirements: [],
  },
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

export type FormClaim = {
  type: ClaimType;
  scope?: {
    type: ScopeType;
    value: string;
  };
  code?: CountryCode;
  customClaimTypeId?: BigNumber;
  customClaimName?: string;
};

export interface FormCondition {
  type: ConditionType;
  target: ConditionTarget;
  claims?: FormClaim[];
  identity?: string;
  trustedClaimIssuers?: InputTrustedClaimIssuer[];
}

export interface FormComplianceRule {
  conditions: FormCondition[];
}

export interface ComplianceRuleFormData {
  complianceRules: FormComplianceRule[];
}
