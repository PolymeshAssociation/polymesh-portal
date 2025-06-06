import { AgentWithGroup } from '@polymeshassociation/polymesh-sdk/types';

export interface IAgentTableItem {
  agentDid: string;
  permissionGroup: string;
  agent: AgentWithGroup;
  actions?: null;
}
