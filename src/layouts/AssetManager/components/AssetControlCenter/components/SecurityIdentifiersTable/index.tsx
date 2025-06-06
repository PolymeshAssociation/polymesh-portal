import React from 'react';
import { Table } from '~/components';
import { SecurityIdentifier } from '../../types';
import { useSecurityIdentifiersTable } from './hooks';

interface ISecurityIdentifiersTableProps {
  identifiers: SecurityIdentifier[];
  onEditIdentifier: (identifierId: string) => void;
  onRemoveIdentifier: (identifierId: string) => void;
}

export const SecurityIdentifiersTable: React.FC<
  ISecurityIdentifiersTableProps
> = ({ identifiers, onEditIdentifier, onRemoveIdentifier }) => {
  const { table, loading, totalItems } = useSecurityIdentifiersTable(
    identifiers,
    onEditIdentifier,
    onRemoveIdentifier,
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
