import { createColumnHelper } from '@tanstack/react-table';
import { ActionsCell } from './components/ActionsCell';
import { ISecurityIdentifierTableItem } from './constants';

const columnHelper = createColumnHelper<ISecurityIdentifierTableItem>();

export const createSecurityIdentifierColumns = (
  onEditIdentifier: (identifierId: string) => void,
  onRemoveIdentifier: (identifierId: string) => void,
) => [
  columnHelper.accessor('type', {
    header: 'Type',
    enableSorting: false,
    cell: (info) => <span>{info.getValue()}</span>,
  }),
  columnHelper.accessor('value', {
    header: 'Identifier',
    enableSorting: false,
    cell: (info) => <span>{info.getValue()}</span>,
  }),
  columnHelper.accessor('actions', {
    header: 'Actions',
    enableSorting: false,
    cell: (info) => (
      <ActionsCell
        identifierId={info.row.original.id}
        onEdit={onEditIdentifier}
        onRemove={onRemoveIdentifier}
      />
    ),
  }),
];
