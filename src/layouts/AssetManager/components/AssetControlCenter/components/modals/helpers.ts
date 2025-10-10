import {
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
