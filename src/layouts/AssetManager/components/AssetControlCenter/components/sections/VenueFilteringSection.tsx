import React, { useState } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { Icon } from '~/components';
import { AddVenueModal } from '../modals';
import { useAssetActionsContext } from '../../context';
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
import { notifyError } from '~/helpers/notifications';

interface VenueFilteringSectionProps {
  asset: TabProps['asset'];
}

export const VenueFilteringSection: React.FC<VenueFilteringSectionProps> = ({
  asset,
}) => {
  const [addVenueModalOpen, setAddVenueModalOpen] = useState(false);
  const { setVenueFiltering, transactionInProcess } = useAssetActionsContext();

  const handleToggleVenueFiltering = async () => {
    try {
      await setVenueFiltering({
        enabled: !asset?.details?.venueFilteringEnabled,
      });
    } catch (error) {
      notifyError(
        `Error toggling venue filtering: ${(error as Error).message}`,
      );
    }
  };

  const handleManageVenues = () => {
    setAddVenueModalOpen(true);
  };

  const handleRemoveVenue = async (venueId: string) => {
    try {
      const currentAllowedVenues = asset?.details?.permittedVenuesIds || [];
      const newAllowedVenues = currentAllowedVenues
        .filter((id) => id !== venueId)
        .map((id) => new BigNumber(id));

      await setVenueFiltering({
        enabled: true,
        allowedVenues: newAllowedVenues,
      });
    } catch (error) {
      notifyError(`Error removing venue: ${(error as Error).message}`);
    }
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
            <AddButton
              onClick={handleToggleVenueFiltering}
              disabled={transactionInProcess}
            >
              <Icon
                name={venueConfig.isEnabled ? 'CloseIcon' : 'Check'}
                size="16px"
              />
              {venueConfig.isEnabled ? 'Disable' : 'Enable'}
            </AddButton>
            <AddButton
              onClick={handleManageVenues}
              disabled={transactionInProcess}
            >
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
              disabled={transactionInProcess}
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

      <AddVenueModal
        isOpen={addVenueModalOpen}
        onClose={() => setAddVenueModalOpen(false)}
        currentAllowedVenues={asset?.details?.permittedVenuesIds || []}
      />
    </>
  );
};
