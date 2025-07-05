import React, { useMemo, useState, useEffect } from 'react';
import type { AgentWithGroup } from '@polymeshassociation/polymesh-sdk/types';
import { Icon } from '~/components';
import { ComingSoonModal } from '../modals';
import { useAssetActionsContext } from '../../context';
import type { TabProps, IPermissionGroup } from '../../types';
import {
  TabSection,
  SectionHeader,
  SectionTitle,
  SectionContent,
  DataList,
  DataItem,
  DataLabel,
  ActionButton,
  EmptyState,
  AddButton,
  GroupHeader,
  GroupTitleSection,
  GroupTitle,
  GroupActions,
  GroupContent,
  PermissionsContainer,
  PermissionItem,
  PermissionIcon,
  PermissionText,
  AgentValue,
  PermissionValue,
} from '../../styles';

interface PermissionGroupsSectionProps {
  asset: TabProps['asset'];
}

export const PermissionGroupsSection: React.FC<
  PermissionGroupsSectionProps
> = ({ asset }) => {
  const { transactionInProcess } = useAssetActionsContext();
  // State for processed permission groups
  const [processedPermissionGroups, setProcessedPermissionGroups] = useState<
    IPermissionGroup[]
  >([]);
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  const handleCreatePermissionGroup = () => {
    setComingSoonFeature('create permission group');
    setComingSoonModalOpen(true);
  };

  const handleEditPermissionGroup = (groupId: string | number) => {
    setComingSoonFeature('edit permission group');
    setComingSoonModalOpen(true);
    // eslint-disable-next-line no-console
    console.log('Edit permission group:', groupId);
  };

  // Get asset agents and permission groups from asset data
  const assetAgents = useMemo(
    () => asset?.details?.agentsWithGroups || [],
    [asset?.details?.agentsWithGroups],
  );
  const permissionGroups = asset?.details?.permissionGroups;

  // Helper function to get group name
  const getGroupName = (groupType: string): string => {
    if (groupType === 'Full') return 'Full Permissions';
    if (groupType === 'PolymeshV1Pia') return 'Primary Issuance Agent';
    return groupType;
  };

  // Process permission groups with proper async handling
  useEffect(() => {
    // Helper function to get group type string from agent (moved inside useEffect)
    const getAgentGroupType = (agent: AgentWithGroup): string => {
      if (!agent.group) return 'Full';
      if ('type' in agent.group) {
        return agent.group.type;
      }
      if ('id' in agent.group) {
        return `Custom Group - ${agent.group.id.toNumber()}`;
      }
      return 'Unknown';
    };

    const processPermissionGroups = async () => {
      const groups: IPermissionGroup[] = [];

      // Process known permission groups - only show ones that have agents assigned
      if (permissionGroups?.known) {
        const knownGroupPromises = permissionGroups.known.map(
          async (knownGroup) => {
            const agentCount = assetAgents.filter((agent) =>
              getAgentGroupType(agent).includes(knownGroup.type),
            ).length;

            // Only add known groups that have agents assigned (filter built-in groups)
            if (agentCount > 0) {
              try {
                // Get permissions for the known group from SDK
                const groupPermissions = await knownGroup.getPermissions();
                return {
                  id: knownGroup.type as string,
                  type: 'known' as const,
                  name: getGroupName(knownGroup.type),
                  agentCount,
                  permissions: {
                    transactions: groupPermissions.transactions || undefined,
                    transactionGroups:
                      groupPermissions.transactionGroups || undefined,
                  },
                } as IPermissionGroup;
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error(
                  `Error getting permissions for known group ${knownGroup.type}:`,
                  error,
                );
                return null;
              }
            }
            return null;
          },
        );

        const knownGroups = await Promise.all(knownGroupPromises);
        const validKnownGroups = knownGroups.filter(
          (group): group is IPermissionGroup => group !== null,
        );
        groups.push(...validKnownGroups);
      }

      // Process custom permission groups - always show all custom groups
      if (permissionGroups?.custom) {
        const customGroupPromises = permissionGroups.custom.map(
          async (customGroup) => {
            try {
              const groupId = customGroup.id;
              const groupIdNum = groupId.toNumber();

              const agentCount = assetAgents.filter((agent) =>
                getAgentGroupType(agent).includes(
                  `Custom Group - ${groupIdNum}`,
                ),
              ).length;

              // Get permissions for the custom group from SDK
              const groupPermissions = await customGroup.getPermissions();
              return {
                id: groupIdNum,
                type: 'custom' as const,
                name: `Custom Group #${groupIdNum}`,
                agentCount,
                permissions: {
                  transactions: groupPermissions.transactions || undefined,
                  transactionGroups:
                    groupPermissions.transactionGroups || undefined,
                },
              } as IPermissionGroup;
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('Error processing custom group:', error);
              return null;
            }
          },
        );

        const customGroups = await Promise.all(customGroupPromises);
        groups.push(
          ...customGroups.filter(
            (group): group is IPermissionGroup => group !== null,
          ),
        );
      }

      setProcessedPermissionGroups(groups);
    };

    if (permissionGroups && assetAgents) {
      processPermissionGroups();
    }
  }, [permissionGroups, assetAgents]);

  return (
    <>
      <TabSection>
        <SectionHeader>
          <SectionTitle>Permission Groups</SectionTitle>
          <AddButton
            onClick={handleCreatePermissionGroup}
            disabled={transactionInProcess}
          >
            <Icon name="Plus" size="16px" />
            Create Group
          </AddButton>
        </SectionHeader>
        <SectionContent>
          {processedPermissionGroups.length > 0 ? (
            <DataList className="two-column">
              {processedPermissionGroups.map((group) => (
                <DataItem key={group.id}>
                  {/* Header with title and action buttons */}
                  <GroupHeader>
                    <GroupTitleSection>
                      <DataLabel>Group Type</DataLabel>
                      <GroupTitle>
                        {group.type === 'known'
                          ? `Built-in: ${group.name}`
                          : `Custom (ID: ${group.id})`}
                      </GroupTitle>
                    </GroupTitleSection>

                    {/* Action buttons in top-right corner */}
                    {group.type === 'custom' && (
                      <GroupActions>
                        <ActionButton
                          onClick={() => handleEditPermissionGroup(group.id)}
                          disabled={transactionInProcess}
                        >
                          <Icon name="Edit" size="14px" />
                        </ActionButton>
                      </GroupActions>
                    )}
                  </GroupHeader>

                  {/* Content section */}
                  <GroupContent>
                    <DataLabel>Assigned Agents</DataLabel>
                    <AgentValue>
                      {group.agentCount === 0
                        ? 'No agents assigned'
                        : `${group.agentCount} agent${group.agentCount === 1 ? '' : 's'} assigned`}
                    </AgentValue>

                    {/* Display permissions for both known and custom groups */}
                    {group.permissions && (
                      <>
                        {/* Special case for Full permission type */}
                        {group.type === 'known' && group.id === 'Full' ? (
                          <>
                            <DataLabel>Allowed Transactions</DataLabel>
                            <PermissionValue>
                              <PermissionsContainer>
                                ✅ All Asset Transactions Allowed
                              </PermissionsContainer>
                            </PermissionValue>
                          </>
                        ) : (
                          <>
                            {/* Display specific transactions for non-Full groups */}
                            {group.permissions.transactions &&
                              group.permissions.transactions.values.length >
                                0 && (
                                <>
                                  <DataLabel>
                                    {group.permissions.transactions.type ===
                                    'Include'
                                      ? 'Allowed Transactions'
                                      : 'Restricted Transactions'}
                                  </DataLabel>
                                  <PermissionValue>
                                    <PermissionsContainer>
                                      {group.permissions.transactions.values.map(
                                        (transaction) => (
                                          <PermissionItem
                                            key={`${group.id}-tx-${transaction}`}
                                          >
                                            <PermissionIcon>
                                              {group.permissions?.transactions
                                                ?.type === 'Exclude'
                                                ? '❌'
                                                : '✅'}
                                            </PermissionIcon>
                                            <PermissionText>
                                              {transaction}
                                            </PermissionText>
                                          </PermissionItem>
                                        ),
                                      )}
                                    </PermissionsContainer>
                                  </PermissionValue>
                                </>
                              )}

                            {/* Display transaction groups */}
                            {group.permissions.transactionGroups &&
                              group.permissions.transactionGroups.length >
                                0 && (
                                <>
                                  <DataLabel>Transaction Groups</DataLabel>
                                  <PermissionValue>
                                    <PermissionsContainer
                                      style={{ maxHeight: '100px' }}
                                    >
                                      {group.permissions.transactionGroups.map(
                                        (txGroup) => (
                                          <PermissionItem
                                            key={`${group.id}-group-${txGroup}`}
                                          >
                                            <PermissionIcon>✅</PermissionIcon>
                                            <PermissionText>
                                              {txGroup}
                                            </PermissionText>
                                          </PermissionItem>
                                        ),
                                      )}
                                    </PermissionsContainer>
                                  </PermissionValue>
                                </>
                              )}
                          </>
                        )}
                      </>
                    )}
                  </GroupContent>
                </DataItem>
              ))}
            </DataList>
          ) : (
            <EmptyState>
              No permission groups found. Permission groups define specific
              permissions for agents.
            </EmptyState>
          )}
        </SectionContent>
      </TabSection>

      <ComingSoonModal
        isOpen={comingSoonModalOpen}
        onClose={() => setComingSoonModalOpen(false)}
        feature={comingSoonFeature}
      />
    </>
  );
};
