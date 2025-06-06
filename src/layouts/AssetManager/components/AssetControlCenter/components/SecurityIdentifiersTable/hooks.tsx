import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import { SecurityIdentifier } from '../../types';
import { createSecurityIdentifierColumns } from './config';
import { parseSecurityIdentifiersData } from './helpers';
import { ISecurityIdentifierTableItem } from './constants';

export const useSecurityIdentifiersTable = (
  identifiers: SecurityIdentifier[],
  onEditIdentifier: (identifierId: string) => void,
  onRemoveIdentifier: (identifierId: string) => void,
) => {
  const [tableData, setTableData] = useState<ISecurityIdentifierTableItem[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  // Memoize the columns to prevent unnecessary re-renders
  const columns = useMemo(
    () => createSecurityIdentifierColumns(onEditIdentifier, onRemoveIdentifier),
    [onEditIdentifier, onRemoveIdentifier],
  );

  useEffect(() => {
    setLoading(true);
    try {
      const parsedData = parseSecurityIdentifiersData(identifiers);
      setTableData(parsedData);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse security identifiers data:', error);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, [identifiers]);

  const table = useReactTable<ISecurityIdentifierTableItem>({
    data: tableData,
    columns: columns as ColumnDef<ISecurityIdentifierTableItem>[],
    getCoreRowModel: getCoreRowModel(),
  });

  return {
    table,
    loading,
    totalItems: tableData.length,
  };
};
