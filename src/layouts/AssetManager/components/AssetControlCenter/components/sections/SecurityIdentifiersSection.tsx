import React from 'react';
import { Icon } from '~/components';
import { SecurityIdentifiersTable } from '../SecurityIdentifiersTable';
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
  const handleAddSecurityIdentifier = () => {
    // TODO: Open add security identifier modal
  };

  const handleEditSecurityIdentifier = (identifierId: string) => {
    // TODO: Open edit security identifier modal
    // eslint-disable-next-line no-console
    console.log('Edit identifier:', identifierId);
  };

  const handleRemoveSecurityIdentifier = (identifierId: string) => {
    // TODO: Open remove security identifier confirmation modal
    // eslint-disable-next-line no-console
    console.log('Remove identifier:', identifierId);
  };

  // Extract security identifiers from asset details
  const securityIdentifiers: SecurityIdentifier[] =
    asset?.details?.assetIdentifiers?.map((identifier, index) => ({
      id: `${identifier.type}-${identifier.value}-${index}`,
      type: identifier.type,
      value: identifier.value,
    })) || [];

  return (
    <TabSection>
      <SectionHeader>
        <SectionTitle>Security Identifiers</SectionTitle>
        <AddButton onClick={handleAddSecurityIdentifier}>
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
  );
};
