import React, { useState } from 'react';
import { Icon } from '~/components';
import { ComingSoonModal } from '../modals';
import type { TabProps, VenueConfig } from '../../types';
import { VenuesTable } from '../VenuesTable';
import {
  TabSection,
  SectionHeader,
  SectionTitle,
  SectionContent,
  AddButton,
  EmptyState,
  VenueStatusBadge,
} from '../../styles';

interface VenueFilteringSectionProps {
  asset: TabProps['asset'];
}

export const VenueFilteringSection: React.FC<VenueFilteringSectionProps> = ({
  asset,
}) => {
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  const handleToggleVenueFiltering = () => {
    setComingSoonFeature('toggle venue filtering');
    setComingSoonModalOpen(true);
  };

  const handleManageVenues = () => {
    setComingSoonFeature('add venue restriction');
    setComingSoonModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRemoveVenue = (_venueId: string) => {
    setComingSoonFeature('remove venue restriction');
    setComingSoonModalOpen(true);
  };

  const venueConfig: VenueConfig = {
    isEnabled: asset?.details?.venueFilteringEnabled || false,
    allowedVenues: asset?.details?.permittedVenuesIds || [],
  };

  const permittedVenues = asset?.details?.permittedVenues || [];

  return (
    <>
      <TabSection>
        <SectionHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SectionTitle>Venue Restrictions</SectionTitle>
            <VenueStatusBadge $enabled={venueConfig.isEnabled}>
              {venueConfig.isEnabled ? 'Enabled' : 'Disabled'}
            </VenueStatusBadge>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <AddButton onClick={handleToggleVenueFiltering}>
              <Icon
                name={venueConfig.isEnabled ? 'CloseIcon' : 'Check'}
                size="16px"
              />
              {venueConfig.isEnabled ? 'Disable' : 'Enable'}
            </AddButton>
            <AddButton onClick={handleManageVenues}>
              <Icon name="Plus" size="16px" />
              Add Venue
            </AddButton>
          </div>
        </SectionHeader>
        <SectionContent>
          {permittedVenues.length > 0 && (
            <VenuesTable
              venues={permittedVenues}
              onRemoveVenue={handleRemoveVenue}
            />
          )}
          {permittedVenues.length === 0 && (
            <EmptyState>
              No venues configured. Venues can be added to restrict who can
              create settlement instructions involving this asset.
            </EmptyState>
          )}
        </SectionContent>
      </TabSection>

      <ComingSoonModal
        isOpen={comingSoonModalOpen}
        onClose={() => setComingSoonModalOpen(false)}
        feature={comingSoonFeature}
      />
    </>
  );
};
