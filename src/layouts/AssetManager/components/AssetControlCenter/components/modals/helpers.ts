import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  ClaimType,
  CustomPermissionGroup,
  KnownPermissionGroup,
  PermissionGroupType,
} from '@polymeshassociation/polymesh-sdk/types';

/**
 * Gets the display name for a permission group type
 * @param groupType - The permission group type string
 * @returns The formatted display name for the group
 */
export const getPermissionGroupName = (groupType: string): string => {
  switch (groupType) {
    case PermissionGroupType.Full:
      return 'Full Permissions';
    case PermissionGroupType.ExceptMeta:
      return 'Full without Agent Permissions';
    case PermissionGroupType.PolymeshV1Caa:
      return 'Corporate Action Agent';
    case PermissionGroupType.PolymeshV1Pia:
      return 'Primary Issuance Agent';
    case 'Custom':
      return 'Custom Permissions';
    default:
      return groupType;
  }
};

/**
 * Resolves the permission group entity based on the form selection
 * @param permissionGroup - The selected permission group type ('Custom' or a known group type)
 * @param customGroupId - The custom group ID if 'Custom' is selected
 * @param customGroups - Array of available custom permission groups
 * @param knownGroups - Array of available known permission groups
 * @returns The resolved permission group entity
 * @throws Error if the selected group cannot be found
 */
export const resolvePermissionGroup = (
  permissionGroup: string,
  customGroupId: string | undefined,
  customGroups: CustomPermissionGroup[],
  knownGroups: KnownPermissionGroup[],
): KnownPermissionGroup | CustomPermissionGroup => {
  if (permissionGroup === 'Custom') {
    if (!customGroupId) {
      throw new Error('Custom group ID is required when Custom is selected');
    }
    // Find the custom group entity by ID
    const selectedCustomGroup = customGroups.find(
      (group) => group.id.toString() === customGroupId,
    );
    if (!selectedCustomGroup) {
      throw new Error('Custom group entity not found');
    }
    return selectedCustomGroup;
  }

  // Find the known group entity by type
  const knownGroup = knownGroups.find(
    (group) => group.type === permissionGroup,
  );
  if (!knownGroup) {
    throw new Error('Known permission group not found');
  }
  return knownGroup;
};

/**
 * Filters input to allow only integer values (whole numbers)
 * @param e - The form event from the input element
 */
export const filterToIntegerInput = (
  e: React.FormEvent<HTMLInputElement>,
): void => {
  e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
};

/**
 * Filters input to allow only decimal values (numbers with up to one decimal point)
 * @param e - The form event from the input element
 */
export const filterToDecimalInput = (
  e: React.FormEvent<HTMLInputElement>,
): void => {
  e.currentTarget.value = e.currentTarget.value
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*)\./g, '$1');
};

/**
 * Builds the value object for Accredited or Affiliate scoped stats
 */
export function buildScopedClaimValue(
  claimType: ClaimType.Accredited,
  withClaim: string | undefined,
  withoutClaim: string | undefined,
):
  | {
      accredited: BigNumber;
      nonAccredited: BigNumber;
    }
  | undefined;

export function buildScopedClaimValue(
  claimType: ClaimType.Affiliate,
  withClaim: string | undefined,
  withoutClaim: string | undefined,
):
  | {
      affiliate: BigNumber;
      nonAffiliate: BigNumber;
    }
  | undefined;

export function buildScopedClaimValue(
  claimType: ClaimType.Accredited | ClaimType.Affiliate,
  withClaim: string | undefined,
  withoutClaim: string | undefined,
) {
  if (!withClaim && !withoutClaim) return undefined;

  const withValue = new BigNumber(withClaim || 0);
  const withoutValue = new BigNumber(withoutClaim || 0);

  if (claimType === ClaimType.Accredited) {
    return {
      accredited: withValue,
      nonAccredited: withoutValue,
    };
  }

  return {
    affiliate: withValue,
    nonAffiliate: withoutValue,
  };
}
