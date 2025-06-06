import React from 'react';
import { AgentWithGroup } from '@polymeshassociation/polymesh-sdk/types';
import { Icon } from '~/components';
import { AgentsTable } from '../AgentsTable';
import type { TabProps } from '../../types';
import {
  TabSection,
  SectionHeader,
  SectionTitle,
  SectionContent,
  EmptyState,
  AddButton,
} from '../../styles';

interface AssetAgentsSectionProps {
  asset: TabProps['asset'];
}

export const AssetAgentsSection: React.FC<AssetAgentsSectionProps> = ({
  asset,
}) => {
  // Extract agents directly from asset details
  const agents: AgentWithGroup[] = asset?.details?.agentsWithGroups || [];

  const handleManageAgents = () => {
    // TODO: Open manage agents modal
  };

  const handleRemoveAgent = (agentDid: string) => {
    // TODO: Open remove agent confirmation modal
    // eslint-disable-next-line no-console
    console.log('Remove agent:', agentDid);
  };

  const handleEditAgent = (agentDid: string) => {
    // TODO: Open edit agent permissions modal
    // eslint-disable-next-line no-console
    console.log('Edit agent:', agentDid);
  };

  return (
    <TabSection>
      <SectionHeader>
        <SectionTitle>Asset Agents</SectionTitle>
        <AddButton onClick={handleManageAgents}>
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
          />
        ) : (
          <EmptyState>
            No agents assigned. Asset agents can perform actions on behalf of
            the asset owner, such as minting tokens or managing compliance.
          </EmptyState>
        )}
      </SectionContent>
    </TabSection>
  );
};
