import React, { useState } from 'react';
import { AgentWithGroup } from '@polymeshassociation/polymesh-sdk/types';
import { Icon } from '~/components';
import { AgentsTable } from '../AgentsTable';
import { ComingSoonModal } from '../modals';
import { useAssetActionsContext } from '../../context';
import type { TabProps } from '../../types';
import { notifyError } from '~/helpers/notifications';
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
  const { removeAssetAgent, transactionInProcess } = useAssetActionsContext();

  // Extract agents directly from asset details
  const agents: AgentWithGroup[] = asset?.details?.agentsWithGroups || [];

  const handleManageAgents = () => {
    setComingSoonFeature('add asset agent');
    setComingSoonModalOpen(true);
  };

  const handleRemoveAgent = async (agentDid: string) => {
    try {
      await removeAssetAgent(agentDid);
    } catch (error) {
      notifyError(`Error removing asset agent: ${(error as Error).message}`);
    }
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
          <AddButton
            onClick={handleManageAgents}
            disabled={transactionInProcess}
          >
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

      <ComingSoonModal
        isOpen={comingSoonModalOpen}
        onClose={() => setComingSoonModalOpen(false)}
        feature={comingSoonFeature}
      />
    </>
  );
};
