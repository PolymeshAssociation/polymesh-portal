import { SecurityIdentifier as SDKSecurityIdentifier } from '@polymeshassociation/polymesh-sdk/types';
import React, { useState } from 'react';
import { Icon } from '~/components';
import { useAssetActionsContext } from '../../context';
import {
  AddButton,
  EmptyState,
  SectionContent,
  SectionHeader,
  SectionTitle,
  TabSection,
} from '../../styles';
import type { SecurityIdentifier, TabProps } from '../../types';
import { SecurityIdentifiersTable } from '../SecurityIdentifiersTable';
import {
  AddSecurityIdentifierModal,
  EditSecurityIdentifierModal,
} from '../modals';

interface SecurityIdentifiersSectionProps {
  asset: TabProps['asset'];
}

export const SecurityIdentifiersSection: React.FC<
  SecurityIdentifiersSectionProps
> = ({ asset }) => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [identifierToEdit, setIdentifierToEdit] =
    useState<SecurityIdentifier | null>(null);

  const { modifyAssetIdentifiers, transactionInProcess } =
    useAssetActionsContext();

  // Extract security identifiers from asset details
  const securityIdentifiers: SecurityIdentifier[] =
    asset?.details?.assetIdentifiers?.map((identifier) => ({
      id: `${identifier.type}|${identifier.value}`,
      type: identifier.type,
      value: identifier.value,
    })) || [];

  const handleAddSecurityIdentifier = () => {
    setAddModalOpen(true);
  };

  const handleEditSecurityIdentifier = (identifierId: string) => {
    // Parse identifierId to get type and value
    const [type, value] = identifierId.split('|');

    const identifierFound = securityIdentifiers.find(
      (identifier) => identifier.type === type && identifier.value === value,
    );
    if (identifierFound) {
      setIdentifierToEdit(identifierFound);
      setEditModalOpen(true);
    }
  };

  const handleRemoveSecurityIdentifier = async (identifierId: string) => {
    if (!asset?.details?.assetIdentifiers) {
      return;
    }

    // Parse identifierId to get type and value
    const [type, value] = identifierId.split('|');

    // Filter out the identifier to remove
    const remainingIdentifiers = asset.details.assetIdentifiers.filter(
      (identifier) => !(identifier.type === type && identifier.value === value),
    );

    // Call the asset action to update identifiers
    await modifyAssetIdentifiers(remainingIdentifiers);
  };

  const handleAddIdentifierSubmit = async (
    newIdentifiers: SDKSecurityIdentifier[],
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    await modifyAssetIdentifiers(newIdentifiers, onTransactionRunning);
  };

  const handleEditIdentifierSubmit = async (
    updatedIdentifiers: SDKSecurityIdentifier[],
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    await modifyAssetIdentifiers(updatedIdentifiers, onTransactionRunning);
  };

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

      <AddSecurityIdentifierModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        existingIdentifiers={securityIdentifiers}
        onAddIdentifier={handleAddIdentifierSubmit}
        transactionInProcess={transactionInProcess}
      />

      <EditSecurityIdentifierModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setIdentifierToEdit(null);
        }}
        identifierToEdit={identifierToEdit}
        allIdentifiers={securityIdentifiers}
        onEditIdentifier={handleEditIdentifierSubmit}
        transactionInProcess={transactionInProcess}
      />
    </>
  );
};
