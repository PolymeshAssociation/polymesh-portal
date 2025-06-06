import { createColumnHelper } from '@tanstack/react-table';
import { AgentDidCell } from './components/AgentDidCell';
import { ActionsCell } from './components/ActionsCell';
import { IAgentTableItem } from './constants';

const columnHelper = createColumnHelper<IAgentTableItem>();

export const createAgentColumns = (
  onEditAgent: (agentDid: string) => void,
  onRemoveAgent: (agentDid: string) => void,
) => [
  columnHelper.accessor('agentDid', {
    header: 'Agent DID',
    enableSorting: false,
    cell: (info) => <AgentDidCell agentDid={info.getValue()} />,
  }),
  columnHelper.accessor('permissionGroup', {
    header: 'Permission Group',
    enableSorting: false,
    cell: (info) => <span>{info.getValue()}</span>,
  }),
  columnHelper.accessor('actions', {
    header: 'Actions',
    enableSorting: false,
    cell: (info) => (
      <ActionsCell
        agentDid={info.row.original.agentDid}
        onEdit={onEditAgent}
        onRemove={onRemoveAgent}
      />
    ),
  }),
];
