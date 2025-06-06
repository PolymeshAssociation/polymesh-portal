import React from 'react';
import { Icon } from '~/components';
import { ActionButton } from '../../../../styles';

interface IActionsCellProps {
  identifierId: string;
  onEdit: (identifierId: string) => void;
  onRemove: (identifierId: string) => void;
}

export const ActionsCell: React.FC<IActionsCellProps> = ({
  identifierId,
  onEdit,
  onRemove,
}) => {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          onEdit(identifierId);
        }}
        title="Edit Security Identifier"
      >
        <Icon name="Edit" size="14px" />
      </ActionButton>
      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          onRemove(identifierId);
        }}
        title="Remove Security Identifier"
      >
        <Icon name="Delete" size="14px" />
      </ActionButton>
    </div>
  );
};
