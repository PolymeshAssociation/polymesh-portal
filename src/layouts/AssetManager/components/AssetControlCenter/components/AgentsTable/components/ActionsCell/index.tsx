import React from 'react';
import { Icon } from '~/components';
import { ActionButton } from '../../../../styles';
import { StyledActionsCell } from './styles';

interface IActionsCellProps {
  agentDid: string;
  onEdit: (agentDid: string) => void;
  onRemove: (agentDid: string) => void;
}

export const ActionsCell: React.FC<IActionsCellProps> = ({
  agentDid,
  onEdit,
  onRemove,
}) => {
  return (
    <StyledActionsCell>
      <ActionButton onClick={() => onEdit(agentDid)}>
        <Icon name="Edit" size="14px" />
      </ActionButton>
      <ActionButton onClick={() => onRemove(agentDid)}>
        <Icon name="Delete" size="14px" />
      </ActionButton>
    </StyledActionsCell>
  );
};
