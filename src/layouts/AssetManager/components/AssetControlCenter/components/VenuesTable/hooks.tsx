import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import { Venue, VenueDetails } from '@polymeshassociation/polymesh-sdk/types';
import { createVenueColumns } from './config';
import { parseVenuesData } from './helpers';
import { IVenueTableItem } from './constants';

export const useVenuesTable = (
  venues: Venue[],
  onRemoveVenue?: (venueId: string) => void,
) => {
  const [tableData, setTableData] = useState<IVenueTableItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Memoize the columns to prevent unnecessary re-renders
  const columns = useMemo(
    () => createVenueColumns(onRemoveVenue),
    [onRemoveVenue],
  );

  useEffect(() => {
    const fetchVenueDetails = async () => {
      if (venues.length === 0) {
        setTableData([]);
        return;
      }

      setLoading(true);
      try {
        // Fetch details for all venues
        const venueDetailsPromises = venues.map(async (venue) => {
          try {
            const details = await venue.details();
            return { id: venue.id.toString(), details };
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(
              `Failed to fetch details for venue ${venue.id}:`,
              error,
            );
            return {
              id: venue.id.toString(),
              details: {
                description: 'Error loading description',
                owner: { did: 'Unknown' },
                type: 'Other',
              } as VenueDetails,
            };
          }
        });

        const venueDetailsResults = await Promise.all(venueDetailsPromises);

        // Create a map of venue ID to details
        const venueDetailsMap: Record<string, VenueDetails> = {};
        venueDetailsResults.forEach(({ id, details }) => {
          venueDetailsMap[id] = details;
        });

        const parsedData = parseVenuesData(venues, venueDetailsMap);
        setTableData(parsedData);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch venue details:', error);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();
  }, [venues]);

  const table = useReactTable<IVenueTableItem>({
    data: tableData,
    columns: columns as ColumnDef<IVenueTableItem>[],
    getCoreRowModel: getCoreRowModel(),
  });

  return {
    table,
    loading,
    totalItems: tableData.length,
  };
};
