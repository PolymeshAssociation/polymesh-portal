import React, { useState } from 'react';
import { Icon } from '~/components';
import { SecurityIdentifiersTable } from '../SecurityIdentifiersTable';
import { ComingSoonModal } from '../modals';
import { useAssetActionsContext } from '../../context';
import type { TabProps, SecurityIdentifier } from '../../types';
import {
  TabSection,
  SectionHeader,
  SectionTitle,
  SectionContent,
  EmptyState,
  AddButton,
} from '../../styles';

interface SecurityIdentifiersSectionProps {
  asset: TabProps['asset'];
}

export const SecurityIdentifiersSection: React.FC<
  SecurityIdentifiersSectionProps
> = ({ asset }) => {
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  const { modifyAssetIdentifiers, transactionInProcess } =
    useAssetActionsContext();

  const handleAddSecurityIdentifier = () => {
    setComingSoonFeature('add security identifier');
    setComingSoonModalOpen(true);
  };

  const handleEditSecurityIdentifier = (identifierId: string) => {
    setComingSoonFeature('edit security identifier');
    setComingSoonModalOpen(true);
    // eslint-disable-next-line no-console
    console.log('Edit identifier:', identifierId);
  };

  const handleRemoveSecurityIdentifier = async (identifierId: string) => {
    if (!asset?.details?.assetIdentifiers) {
      return;
    }

    // Parse the identifierId to find the index to remove
    const indexToRemove = parseInt(identifierId.split('-').pop() || '0', 10);

    // Filter out the identifier to remove
    const remainingIdentifiers = asset.details.assetIdentifiers.filter(
      (_, index) => index !== indexToRemove,
    );

    // Call the asset action to update identifiers
    await modifyAssetIdentifiers(remainingIdentifiers);
  };

  // Extract security identifiers from asset details
  const securityIdentifiers: SecurityIdentifier[] =
    asset?.details?.assetIdentifiers?.map((identifier, index) => ({
      id: `${identifier.type}-${identifier.value}-${index}`,
      type: identifier.type,
      value: identifier.value,
    })) || [];

  return (
    <>
      <TabSection>
        <SectionHeader>
          <SectionTitle>Security Identifiers</SectionTitle>
          <AddButton
            onClick={handleAddSecurityIdentifier}
            disabled={transactionInProcess}
          >
            <Icon name="Plus" size="16px" />
            Add Identifier
          </AddButton>
        </SectionHeader>
        <SectionContent>
          {securityIdentifiers.length > 0 ? (
            <SecurityIdentifiersTable
              identifiers={securityIdentifiers}
              onEditIdentifier={handleEditSecurityIdentifier}
              onRemoveIdentifier={handleRemoveSecurityIdentifier}
              disabled={transactionInProcess}
            />
          ) : (
            <EmptyState>
              No security identifiers configured. Security identifiers are
              alternative ways to reference your asset, such as ISIN, CUSIP, or
              LEI codes.
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
