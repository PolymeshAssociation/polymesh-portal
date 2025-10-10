import { AgentWithGroup } from '@polymeshassociation/polymesh-sdk/types';
import { getPermissionGroupName } from '../modals/helpers';
import { IAgentTableItem } from './constants';

// Helper function to get group type string from agent
export const getAgentGroupType = (agent: AgentWithGroup): string => {
  if ('type' in agent.group) {
    return agent.group.type;
  }
  if ('id' in agent.group) {
    return `Custom Group - ${agent.group.id.toNumber()}`;
  }
  return 'Unknown';
};

// Parse agents data for the table
export const parseAgentsData = (
  agents: AgentWithGroup[],
): IAgentTableItem[] => {
  return agents.map((agent) => {
    const groupType = getAgentGroupType(agent);
    const groupName = getPermissionGroupName(groupType);

    return {
      agentDid: agent.agent.did,
      permissionGroup: groupName,
      agent,
      actions: null,
    };
  });
};
