import React from 'react';
import { CopyToClipboard } from '~/components';
import { formatDid } from '~/helpers/formatters';
import { StyledAgentDidCell } from './styles';

interface IAgentDidCellProps {
  agentDid: string;
}

export const AgentDidCell: React.FC<IAgentDidCellProps> = ({ agentDid }) => {
  return (
    <StyledAgentDidCell>
      <span>{formatDid(agentDid, 8, 8)}</span>
      <CopyToClipboard value={agentDid} />
    </StyledAgentDidCell>
  );
};
