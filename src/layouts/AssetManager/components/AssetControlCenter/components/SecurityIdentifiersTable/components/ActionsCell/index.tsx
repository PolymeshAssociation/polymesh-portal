import React from 'react';
import { Icon } from '~/components';
import { ActionButton } from '../../../../styles';

interface IActionsCellProps {
  identifierId: string;
  onEdit: (identifierId: string) => void;
  onRemove: (identifierId: string) => void;
  disabled?: boolean;
}

export const ActionsCell: React.FC<IActionsCellProps> = ({
  identifierId,
  onEdit,
  onRemove,
  disabled = false,
}) => {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          onEdit(identifierId);
        }}
        title="Edit Security Identifier"
        disabled={disabled}
      >
        <Icon name="Edit" size="14px" />
      </ActionButton>
      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          onRemove(identifierId);
        }}
        title="Remove Security Identifier"
        disabled={disabled}
      >
        <Icon name="Delete" size="14px" />
      </ActionButton>
    </div>
  );
};
