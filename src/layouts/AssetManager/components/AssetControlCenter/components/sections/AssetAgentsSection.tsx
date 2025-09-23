import {
  AgentWithGroup,
  CustomPermissionGroup,
  Identity,
  KnownPermissionGroup,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useState } from 'react';
import { Icon } from '~/components';
import { notifyError } from '~/helpers/notifications';
import { useAssetActionsContext } from '../../context';
import {
  AddButton,
  EmptyState,
  SectionContent,
  SectionHeader,
  SectionTitle,
  TabSection,
} from '../../styles';
import type { TabProps } from '../../types';
import { AgentsTable } from '../AgentsTable';
import { AddAgentModal, EditAgentModal } from '../modals';

interface AssetAgentsSectionProps {
  asset: TabProps['asset'];
}

export const AssetAgentsSection: React.FC<AssetAgentsSectionProps> = ({
  asset,
}) => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<AgentWithGroup | null>(null);

  const {
    removeAssetAgent,
    inviteAssetAgent,
    modifyAgentPermissions,
    transactionInProcess,
  } = useAssetActionsContext();

  // Extract agents directly from asset details
  const agents: AgentWithGroup[] = asset.details?.agentsWithGroups || [];

  const handleAddAgent = () => {
    setAddModalOpen(true);
  };

  const handleRemoveAgent = async (agentDid: string) => {
    try {
      await removeAssetAgent(agentDid);
    } catch (error) {
      notifyError(`Error removing asset agent: ${(error as Error).message}`);
    }
  };

  const handleEditAgent = (agentDid: string) => {
    // Find the agent to get current group info
    const agentWithGroup = agents.find((a) => a.agent.did === agentDid);

    setAgentToEdit(agentWithGroup || null);
    setEditModalOpen(true);
  };

  const handleAddAgentSubmit = async (params: {
    target: string;
    permissions: KnownPermissionGroup | CustomPermissionGroup;
    expiry?: Date;
    onTransactionRunning?: () => void | Promise<void>;
  }) => {
    await inviteAssetAgent(params);
  };

  const handleEditAgentSubmit = async (params: {
    agent: Identity;
    group: KnownPermissionGroup | CustomPermissionGroup;
    onTransactionRunning?: () => void | Promise<void>;
  }) => {
    await modifyAgentPermissions(params);
  };

  return (
    <>
      <TabSection>
        <SectionHeader>
          <SectionTitle>Asset Agents</SectionTitle>
          <AddButton onClick={handleAddAgent} disabled={transactionInProcess}>
            <Icon name="Plus" size="16px" />
            Add Agents
          </AddButton>
        </SectionHeader>
        <SectionContent>
          {agents.length > 0 ? (
            <AgentsTable
              agents={agents}
              onRemoveAgent={handleRemoveAgent}
              onEditAgent={handleEditAgent}
              disabled={transactionInProcess}
            />
          ) : (
            <EmptyState>
              No agents assigned. Asset agents can perform actions on behalf of
              the asset owner, such as minting tokens or managing compliance.
            </EmptyState>
          )}
        </SectionContent>
      </TabSection>

      <AddAgentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        permissionGroups={asset.details?.permissionGroups}
        onAddAgent={handleAddAgentSubmit}
        transactionInProcess={transactionInProcess}
      />

      <EditAgentModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setAgentToEdit(null);
        }}
        agentWithGroup={agentToEdit}
        permissionGroups={asset.details?.permissionGroups}
        onEditAgent={handleEditAgentSubmit}
        transactionInProcess={transactionInProcess}
      />
    </>
  );
};
