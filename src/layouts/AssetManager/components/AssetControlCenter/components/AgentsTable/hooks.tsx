import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import { AgentWithGroup } from '@polymeshassociation/polymesh-sdk/types';
import { createAgentColumns } from './config';
import { parseAgentsData } from './helpers';
import { IAgentTableItem } from './constants';

export const useAgentsTable = (
  agents: AgentWithGroup[],
  onEditAgent: (agentDid: string) => void,
  onRemoveAgent: (agentDid: string) => void,
) => {
  const [tableData, setTableData] = useState<IAgentTableItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Memoize the columns to prevent unnecessary re-renders
  const columns = useMemo(
    () => createAgentColumns(onEditAgent, onRemoveAgent),
    [onEditAgent, onRemoveAgent],
  );

  useEffect(() => {
    setLoading(true);
    try {
      const parsedData = parseAgentsData(agents);
      setTableData(parsedData);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse agents data:', error);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, [agents]);

  const table = useReactTable<IAgentTableItem>({
    data: tableData,
    columns: columns as ColumnDef<IAgentTableItem>[],
    getCoreRowModel: getCoreRowModel(),
  });

  return {
    table,
    loading,
    totalItems: tableData.length,
  };
};
