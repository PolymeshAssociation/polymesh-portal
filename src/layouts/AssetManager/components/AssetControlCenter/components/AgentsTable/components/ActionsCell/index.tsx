import React from 'react';
import { Icon } from '~/components';
import { ActionButton } from '../../../../styles';
import { StyledActionsCell } from './styles';

interface IActionsCellProps {
  agentDid: string;
  onEdit: (agentDid: string) => void;
  onRemove: (agentDid: string) => void;
  disabled?: boolean;
}

export const ActionsCell: React.FC<IActionsCellProps> = ({
  agentDid,
  onEdit,
  onRemove,
  disabled = false,
}) => {
  return (
    <StyledActionsCell>
      <ActionButton onClick={() => onEdit(agentDid)} disabled={disabled}>
        <Icon name="Edit" size="14px" />
      </ActionButton>
      <ActionButton onClick={() => onRemove(agentDid)} disabled={disabled}>
        <Icon name="Delete" size="14px" />
      </ActionButton>
    </StyledActionsCell>
  );
};
