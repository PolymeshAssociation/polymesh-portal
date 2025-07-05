import React from 'react';
import { AgentWithGroup } from '@polymeshassociation/polymesh-sdk/types';
import { Table } from '~/components';
import { useAgentsTable } from './hooks';

interface IAgentsTableProps {
  agents: AgentWithGroup[];
  onEditAgent: (agentDid: string) => void;
  onRemoveAgent: (agentDid: string) => void;
  disabled?: boolean;
}

export const AgentsTable: React.FC<IAgentsTableProps> = ({
  agents,
  onEditAgent,
  onRemoveAgent,
  disabled = false,
}) => {
  const { table, loading, totalItems } = useAgentsTable(
    agents,
    onEditAgent,
    onRemoveAgent,
    disabled,
  );

  return (
    <Table
      data={{ table }}
      loading={loading}
      totalItems={totalItems}
      noBoxShadow
    />
  );
};
