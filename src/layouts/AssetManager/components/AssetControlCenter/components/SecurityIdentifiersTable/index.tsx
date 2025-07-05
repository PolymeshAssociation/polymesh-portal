import React from 'react';
import { Table } from '~/components';
import { SecurityIdentifier } from '../../types';
import { useSecurityIdentifiersTable } from './hooks';

interface ISecurityIdentifiersTableProps {
  identifiers: SecurityIdentifier[];
  onEditIdentifier: (identifierId: string) => void;
  onRemoveIdentifier: (identifierId: string) => void;
  disabled?: boolean;
}

export const SecurityIdentifiersTable: React.FC<
  ISecurityIdentifiersTableProps
> = ({
  identifiers,
  onEditIdentifier,
  onRemoveIdentifier,
  disabled = false,
}) => {
  const { table, loading, totalItems } = useSecurityIdentifiersTable(
    identifiers,
    onEditIdentifier,
    onRemoveIdentifier,
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
