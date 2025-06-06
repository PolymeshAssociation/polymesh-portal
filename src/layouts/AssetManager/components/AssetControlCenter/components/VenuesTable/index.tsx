import React from 'react';
import { Venue } from '@polymeshassociation/polymesh-sdk/types';
import { Table } from '~/components';
import { useVenuesTable } from './hooks';

interface IVenuesTableProps {
  venues: Venue[];
  onRemoveVenue?: (venueId: string) => void;
}

export const VenuesTable: React.FC<IVenuesTableProps> = ({
  venues,
  onRemoveVenue,
}) => {
  const { table, loading, totalItems } = useVenuesTable(venues, onRemoveVenue);

  return (
    <Table
      data={{ table }}
      loading={loading}
      totalItems={totalItems}
      noBoxShadow
    />
  );
};
