import { ColumnDef } from '@tanstack/react-table';
import { Icon, CopyToClipboard } from '~/components';
import { formatDid } from '~/helpers/formatters';
import { IVenueTableItem } from './constants';
import { ActionButton } from '../../styles';

export const createVenueColumns = (
  onRemoveVenue?: (venueId: string) => void,
): ColumnDef<IVenueTableItem>[] => {
  const columns: ColumnDef<IVenueTableItem>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
      cell: ({ getValue }) => {
        const id = getValue<string>();
        return <span>{id}</span>;
      },
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ getValue }) => {
        const description = getValue<string>();
        return <span>{description}</span>;
      },
    },
    {
      header: 'Owner DID',
      accessorKey: 'ownerDid',
      cell: ({ getValue }) => {
        const ownerDid = getValue<string>();
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{formatDid(ownerDid, 8, 8)}</span>
            <CopyToClipboard value={ownerDid} />
          </div>
        );
      },
    },
    {
      header: 'Venue Type',
      accessorKey: 'type',
      cell: ({ getValue }) => {
        const type = getValue<string>();
        return <span>{type}</span>;
      },
    },
  ];

  // Add action column if remove handler is provided
  if (onRemoveVenue) {
    columns.push({
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        const venue = row.original;
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                onRemoveVenue(venue.id);
              }}
              title="Remove Venue"
            >
              <Icon name="Delete" size="14px" />
            </ActionButton>
          </div>
        );
      },
    });
  }

  return columns;
};
