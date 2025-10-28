import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import React, { useState } from 'react';
import { ConfirmationModal, Icon } from '~/components';
import { notifyError } from '~/helpers/notifications';
import { useAssetActionsContext } from '../../context';
import {
  AddButton,
  EmptyState,
  SectionContent,
  SectionHeader,
  SectionTitle,
  TabSection,
  VenueStatusBadge,
} from '../../styles';
import type { TabProps, VenueConfig } from '../../types';
import { AddVenueModal } from '../modals';
import { VenuesTable } from '../VenuesTable';

interface VenueFilteringSectionProps {
  asset: TabProps['asset'];
}

export const VenueFilteringSection: React.FC<VenueFilteringSectionProps> = ({
  asset,
}) => {
  const [addVenueModalOpen, setAddVenueModalOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [venueIdToRemove, setVenueIdToRemove] = useState<string | null>(null);
  const { setVenueFiltering, transactionInProcess } = useAssetActionsContext();

  const handleToggleVenueFiltering = () => {
    setToggleConfirmOpen(true);
  };

  const confirmToggleVenueFiltering = async () => {
    try {
      await setVenueFiltering({
        enabled: !asset?.details?.venueFilteringEnabled,
      });
      setToggleConfirmOpen(false);
    } catch (error) {
      notifyError(
        `Error toggling venue filtering: ${(error as Error).message}`,
      );
    }
  };

  const handleAddVenue = () => {
    setAddVenueModalOpen(true);
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
            <AddButton onClick={handleAddVenue} disabled={transactionInProcess}>
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
        onAddVenues={setVenueFiltering}
        transactionInProcess={transactionInProcess}
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

      <ConfirmationModal
        isOpen={toggleConfirmOpen}
        onClose={() => setToggleConfirmOpen(false)}
        onConfirm={confirmToggleVenueFiltering}
        title={`${
          asset?.details?.venueFilteringEnabled ? 'Disable' : 'Enable'
        } Venue Restrictions`}
        message={`Are you sure you want to ${
          asset?.details?.venueFilteringEnabled ? 'disable' : 'enable'
        } venue restrictions for this asset?`}
        confirmLabel={
          asset?.details?.venueFilteringEnabled ? 'Disable' : 'Enable'
        }
        cancelLabel="Cancel"
        isProcessing={transactionInProcess}
      />
    </>
  );
};
