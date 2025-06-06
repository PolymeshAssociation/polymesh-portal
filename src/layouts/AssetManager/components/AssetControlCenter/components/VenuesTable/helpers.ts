import { Venue, VenueDetails } from '@polymeshassociation/polymesh-sdk/types';
import { IVenueTableItem } from './constants';

export const parseVenuesData = (
  venues: Venue[],
  venueDetailsMap: Record<string, VenueDetails>,
): IVenueTableItem[] => {
  return venues.map((venue) => {
    const details = venueDetailsMap[venue.id.toString()];
    return {
      id: venue.id.toString(),
      description: details?.description || 'N/A',
      ownerDid: details?.owner?.did || 'Unknown',
      type: details?.type || 'Unknown',
    };
  });
};
