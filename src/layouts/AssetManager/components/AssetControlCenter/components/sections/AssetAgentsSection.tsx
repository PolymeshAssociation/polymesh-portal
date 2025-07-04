import React, { useState } from 'react';
import { AgentWithGroup } from '@polymeshassociation/polymesh-sdk/types';
import { Icon } from '~/components';
import { AgentsTable } from '../AgentsTable';
import { ComingSoonModal } from '../modals';
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
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  // Extract agents directly from asset details
  const agents: AgentWithGroup[] = asset?.details?.agentsWithGroups || [];

  const handleManageAgents = () => {
    setComingSoonFeature('add asset agent');
    setComingSoonModalOpen(true);
  };

  const handleRemoveAgent = (agentDid: string) => {
    setComingSoonFeature('remove asset agent');
    setComingSoonModalOpen(true);
    // eslint-disable-next-line no-console
    console.log('Remove agent:', agentDid);
  };

  const handleEditAgent = (agentDid: string) => {
    setComingSoonFeature('edit asset agent');
    setComingSoonModalOpen(true);
    // eslint-disable-next-line no-console
    console.log('Edit agent:', agentDid);
  };

  return (
    <>
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

      <ComingSoonModal
        isOpen={comingSoonModalOpen}
        onClose={() => setComingSoonModalOpen(false)}
        feature={comingSoonFeature}
      />
    </>
  );
};
