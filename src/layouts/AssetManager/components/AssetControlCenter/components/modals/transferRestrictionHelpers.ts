import type { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  ClaimCountRestrictionValue,
  ClaimPercentageRestrictionValue,
  ClaimType,
  CountryCode,
  InputStatClaim,
  TransferRestriction,
  TransferRestrictionClaimCountInput,
  TransferRestrictionInputClaimPercentage,
  TransferRestrictionInputCount,
  TransferRestrictionInputPercentage,
  TransferRestrictionType,
} from '@polymeshassociation/polymesh-sdk/types';

/**
 * Form claim types used in the UI
 */
export enum FormClaimType {
  Accredited = 'Accredited',
  NotAccredited = 'Accredited - Not Present',
  Affiliate = 'Affiliate',
  NotAffiliate = 'Affiliate - Not Present',
  Jurisdiction = 'Jurisdiction',
}

/**
 * Form data interface for adding a transfer restriction
 */
export interface AddTransferRestrictionForm {
  type: 'Count' | 'Percentage' | 'ClaimCount' | 'ClaimPercentage' | '';
  max: string;
  min?: string;
  claimType?: FormClaimType | '';
  issuer?: string;
  jurisdiction?: CountryCode | 'NONE' | '';
}

/**
 * Form data interface for editing a transfer restriction
 */
export interface EditTransferRestrictionForm {
  max: string;
  min?: string;
}

/**
 * Display restriction interface (from TransferRestrictionsSection)
 */
export interface DisplayRestriction {
  id: string;
  type: 'Count' | 'Percentage' | 'ClaimCount' | 'ClaimPercentage';
  minLimit?: string;
  maxLimit?: string;
  exemptions: number;
  exemptedDids: string[];
  claimType?: string;
  claimIssuer?: string;
  claimDetails?: {
    countryCode?: string;
    accredited?: boolean;
    affiliate?: boolean;
  };
}

/**
 * Get human-readable restriction type description
 */
export const getRestrictionTypeDescription = (
  restrictionType: 'Count' | 'Percentage' | 'ClaimCount' | 'ClaimPercentage',
): string => {
  switch (restrictionType) {
    case 'Count':
      return 'Max. Holder Count';
    case 'Percentage':
      return 'Max Individual Percentage Ownership';
    case 'ClaimCount':
      return 'Claim Holder Count';
    case 'ClaimPercentage':
      return 'Claim Total Percentage Ownership';
    default:
      return restrictionType;
  }
};

/**
 * Get claim type display description with presence/absence indicators
 */
export const getClaimTypeDescription = (
  claimType: string,
  claimDetails?: {
    countryCode?: string;
    accredited?: boolean;
    affiliate?: boolean;
  },
): string => {
  switch (claimType) {
    case 'Jurisdiction':
      return 'Jurisdiction';
    case 'Accredited': {
      const isPresent = claimDetails?.accredited !== false;
      return `Accredited (${isPresent ? 'Present' : 'Not Present'})`;
    }
    case 'Affiliate': {
      const isPresent = claimDetails?.affiliate !== false;
      return `Affiliate (${isPresent ? 'Present' : 'Not Present'})`;
    }
    default:
      return claimType;
  }
};

/**
 * Get full restriction label including claim type for display
 */
export const getFullRestrictionLabel = (
  restriction: DisplayRestriction,
): string => {
  const baseType = getRestrictionTypeDescription(restriction.type);

  // Append claim type if it exists (for claim-based restrictions)
  if (restriction.claimType) {
    return `${baseType} - ${restriction.claimType}`;
  }

  return baseType;
};

/**
 * Convert form claim type to SDK InputStatClaim
 */
export const formClaimTypeToInputStatClaim = (
  claimType: FormClaimType,
  jurisdiction: CountryCode | 'NONE' | '',
): InputStatClaim => {
  switch (claimType) {
    case FormClaimType.Accredited:
      return { type: ClaimType.Accredited, accredited: true };
    case FormClaimType.NotAccredited:
      return { type: ClaimType.Accredited, accredited: false };
    case FormClaimType.Affiliate:
      return { type: ClaimType.Affiliate, affiliate: true };
    case FormClaimType.NotAffiliate:
      return { type: ClaimType.Affiliate, affiliate: false };
    case FormClaimType.Jurisdiction: {
      if (!jurisdiction) {
        throw new Error(
          'Jurisdiction selection is required for Jurisdiction claim type',
        );
      }
      return {
        type: ClaimType.Jurisdiction,
        countryCode: jurisdiction === 'NONE' ? undefined : jurisdiction,
      };
    }
    default:
      throw new Error('Unsupported claim type');
  }
};

/**
 * Reconstruct InputStatClaim from DisplayRestriction claim details
 * Used when editing existing restrictions
 */
const reconstructClaimFromDisplayRestriction = (
  restriction: DisplayRestriction,
): InputStatClaim => {
  if (!restriction.claimType) {
    throw new Error('Claim type is required');
  }

  if (restriction.claimType === 'Jurisdiction') {
    // Support both specific country codes and "No Jurisdiction" (undefined)
    return {
      type: ClaimType.Jurisdiction,
      countryCode: restriction.claimDetails?.countryCode
        ? (restriction.claimDetails.countryCode as CountryCode)
        : undefined,
    };
  }

  if (restriction.claimType === 'Accredited') {
    return {
      type: ClaimType.Accredited,
      accredited: restriction.claimDetails?.accredited !== false,
    };
  }

  if (restriction.claimType === 'Affiliate') {
    return {
      type: ClaimType.Affiliate,
      affiliate: restriction.claimDetails?.affiliate !== false,
    };
  }

  throw new Error(`Unsupported claim type: ${restriction.claimType}`);
};

/**
 * Convert add form data to SDK restriction format
 */
export const formDataToSdkRestriction = async (
  data: AddTransferRestrictionForm,
  sdk: Polymesh,
): Promise<
  | TransferRestrictionInputCount
  | TransferRestrictionInputPercentage
  | TransferRestrictionClaimCountInput
  | TransferRestrictionInputClaimPercentage
> => {
  switch (data.type) {
    case 'Count': {
      return {
        type: TransferRestrictionType.Count,
        count: new BigNumber(data.max),
      } satisfies TransferRestrictionInputCount;
    }
    case 'Percentage': {
      return {
        type: TransferRestrictionType.Percentage,
        percentage: new BigNumber(data.max),
      } satisfies TransferRestrictionInputPercentage;
    }
    case 'ClaimCount': {
      if (!data.issuer || !data.claimType) {
        throw new Error('Issuer and claim type are required for ClaimCount');
      }
      const issuer = await sdk.identities.getIdentity({ did: data.issuer });
      const claim = formClaimTypeToInputStatClaim(
        data.claimType,
        data.jurisdiction || '',
      );

      return {
        type: TransferRestrictionType.ClaimCount,
        min: data.min ? new BigNumber(data.min) : new BigNumber(0),
        max: new BigNumber(data.max),
        issuer,
        claim,
      } satisfies TransferRestrictionClaimCountInput;
    }
    case 'ClaimPercentage': {
      if (!data.issuer || !data.claimType) {
        throw new Error(
          'Issuer and claim type are required for ClaimPercentage',
        );
      }
      const issuer = await sdk.identities.getIdentity({ did: data.issuer });
      const claim = formClaimTypeToInputStatClaim(
        data.claimType,
        data.jurisdiction || '',
      );

      return {
        type: TransferRestrictionType.ClaimPercentage,
        min: data.min ? new BigNumber(data.min) : new BigNumber(0),
        max: new BigNumber(data.max),
        issuer,
        claim,
      } satisfies TransferRestrictionInputClaimPercentage;
    }
    default:
      throw new Error('Invalid restriction type');
  }
};

/**
 * Convert DisplayRestriction to SDK restriction format for editing
 */
export const displayRestrictionToSdkFormat = async (
  restriction: DisplayRestriction,
  editedData: EditTransferRestrictionForm,
  sdk: Polymesh,
): Promise<
  | TransferRestrictionInputCount
  | TransferRestrictionInputPercentage
  | TransferRestrictionClaimCountInput
  | TransferRestrictionInputClaimPercentage
> => {
  switch (restriction.type) {
    case 'Count': {
      return {
        type: TransferRestrictionType.Count,
        count: new BigNumber(editedData.max),
      } satisfies TransferRestrictionInputCount;
    }
    case 'Percentage': {
      return {
        type: TransferRestrictionType.Percentage,
        percentage: new BigNumber(editedData.max),
      } satisfies TransferRestrictionInputPercentage;
    }
    case 'ClaimCount': {
      if (!restriction.claimIssuer || !restriction.claimType) {
        throw new Error(
          'Claim issuer and type are required for ClaimCount restriction',
        );
      }

      const issuer = await sdk.identities.getIdentity({
        did: restriction.claimIssuer,
      });
      const claim = reconstructClaimFromDisplayRestriction(restriction);

      return {
        type: TransferRestrictionType.ClaimCount,
        min: editedData.min ? new BigNumber(editedData.min) : new BigNumber(0),
        max: new BigNumber(editedData.max),
        issuer,
        claim,
      } satisfies TransferRestrictionClaimCountInput;
    }
    case 'ClaimPercentage': {
      if (!restriction.claimIssuer || !restriction.claimType) {
        throw new Error(
          'Claim issuer and type are required for ClaimPercentage restriction',
        );
      }

      const issuer = await sdk.identities.getIdentity({
        did: restriction.claimIssuer,
      });
      const claim = reconstructClaimFromDisplayRestriction(restriction);

      return {
        type: TransferRestrictionType.ClaimPercentage,
        min: editedData.min ? new BigNumber(editedData.min) : new BigNumber(0),
        max: new BigNumber(editedData.max),
        issuer,
        claim,
      } satisfies TransferRestrictionInputClaimPercentage;
    }
    default:
      throw new Error('Invalid restriction type');
  }
};

/**
 * Convert SDK TransferRestriction (output format) to TransferRestrictionInput (input format)
 * This is needed because setRestrictions() requires the input format, not the output format
 */
export const sdkRestrictionToInputFormat = (
  restriction: TransferRestriction,
):
  | TransferRestrictionInputCount
  | TransferRestrictionInputPercentage
  | TransferRestrictionClaimCountInput
  | TransferRestrictionInputClaimPercentage => {
  switch (restriction.type) {
    case TransferRestrictionType.Count:
      return {
        type: TransferRestrictionType.Count,
        count: restriction.value,
      };
    case TransferRestrictionType.Percentage:
      return {
        type: TransferRestrictionType.Percentage,
        percentage: restriction.value,
      };
    case TransferRestrictionType.ClaimCount: {
      const value = restriction.value as ClaimCountRestrictionValue;
      return {
        type: TransferRestrictionType.ClaimCount,
        min: value.min,
        max: value.max,
        issuer: value.issuer,
        claim: value.claim,
      };
    }
    case TransferRestrictionType.ClaimPercentage: {
      const value = restriction.value as ClaimPercentageRestrictionValue;
      return {
        type: TransferRestrictionType.ClaimPercentage,
        min: value.min,
        max: value.max,
        issuer: value.issuer,
        claim: value.claim,
      };
    }
    default:
      throw new Error('Unknown restriction type');
  }
};
