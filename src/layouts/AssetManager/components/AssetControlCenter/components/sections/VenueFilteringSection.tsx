import React, { useState } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { ConfirmationModal, Icon } from '~/components';
import { ComingSoonModal } from '../modals';
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
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [venueIdToRemove, setVenueIdToRemove] = useState<string | null>(null);
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
    setComingSoonFeature('add venue restriction');
    setComingSoonModalOpen(true);
  };

  const handleRemoveVenue = (venueId: string) => {
    setVenueIdToRemove(venueId);
    setRemoveConfirmOpen(true);
  };

  const confirmRemoveVenue = async () => {
    if (venueIdToRemove) {
      try {
        await setVenueFiltering({
          disallowedVenues: [new BigNumber(venueIdToRemove)],
        });
        setVenueIdToRemove(null);
      } catch (error) {
        notifyError(
          `Error removing venue restriction: ${(error as Error).message}`,
        );
      }
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

      <ComingSoonModal
        isOpen={comingSoonModalOpen}
        onClose={() => setComingSoonModalOpen(false)}
        feature={comingSoonFeature}
      />

      <ConfirmationModal
        isOpen={removeConfirmOpen}
        onClose={() => {
          setRemoveConfirmOpen(false);
          setVenueIdToRemove(null);
        }}
        onConfirm={confirmRemoveVenue}
        title="Remove Venue Restriction"
        message={`Are you sure you want to remove venue ${venueIdToRemove} from the allowed venues list?`}
        confirmLabel="Remove Venue"
        isProcessing={transactionInProcess}
      />
    </>
  );
};
