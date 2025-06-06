import React from 'react';
import { Icon } from '~/components';
import type { TabProps, AssetDocument } from '../../types';
import {
  TabSection,
  SectionHeader,
  SectionTitle,
  SectionContent,
  DataList,
  DataItem,
  ActionButton,
  EmptyState,
  AddButton,
  GroupHeader,
  GroupTitleSection,
  GroupActions,
  GroupContent,
  InlineRow,
  InlineLabel,
  InlineValue,
} from '../../styles';

interface AssetDocumentsSectionProps {
  asset: TabProps['asset'];
}

export const AssetDocumentsSection: React.FC<AssetDocumentsSectionProps> = ({
  asset,
}) => {
  const handleAddDocument = () => {
    // TODO: Open add document modal
  };

  const handleEditDocument = (documentId: string) => {
    // TODO: Open edit document modal
    // eslint-disable-next-line no-console
    console.log('Edit document:', documentId);
  };

  const handleDeleteDocument = (documentId: string) => {
    // TODO: Open delete document confirmation modal
    // eslint-disable-next-line no-console
    console.log('Delete document:', documentId);
  };

  // Extract documents from asset data
  const assetDocuments: AssetDocument[] =
    asset?.docs?.map((doc, index) => ({
      id: `doc-${index}`,
      name: doc.name,
      type: doc.type || 'Document',
      contentHash: doc.contentHash || undefined,
      filedAt: doc.filedAt || new Date(),
      uri: doc.uri || '',
    })) || [];

  return (
    <TabSection>
      <SectionHeader>
        <SectionTitle>Asset Documents</SectionTitle>
        <AddButton onClick={handleAddDocument}>
          <Icon name="Plus" size="16px" />
          Add Document
        </AddButton>
      </SectionHeader>
      <SectionContent>
        {assetDocuments.length > 0 ? (
          <DataList className="two-column">
            {assetDocuments.map((document) => (
              <DataItem key={document.id}>
                {/* Header with document name and action buttons */}
                <GroupHeader>
                  <GroupTitleSection>
                    <InlineRow>
                      <InlineLabel>Document Name</InlineLabel>
                      <InlineValue>{document.name}</InlineValue>
                    </InlineRow>
                  </GroupTitleSection>

                  {/* Action buttons in top-right corner */}
                  <GroupActions>
                    <ActionButton
                      onClick={() => handleEditDocument(document.id)}
                    >
                      <Icon name="Edit" size="14px" />
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDeleteDocument(document.id)}
                    >
                      <Icon name="Delete" size="14px" />
                    </ActionButton>
                  </GroupActions>
                </GroupHeader>

                {/* Content section */}
                <GroupContent>
                  <InlineRow>
                    <InlineLabel>Type</InlineLabel>
                    <InlineValue>{document.type}</InlineValue>
                  </InlineRow>

                  <InlineRow>
                    <InlineLabel>URI</InlineLabel>
                    <InlineValue>
                      {document.uri ? (
                        <a
                          href={document.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {document.uri}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </InlineValue>
                  </InlineRow>

                  {document.contentHash && (
                    <InlineRow>
                      <InlineLabel>Content Hash</InlineLabel>
                      <InlineValue>{document.contentHash}</InlineValue>
                    </InlineRow>
                  )}

                  <InlineRow>
                    <InlineLabel>Filed Date</InlineLabel>
                    <InlineValue>
                      {document.filedAt.toLocaleDateString()}
                    </InlineValue>
                  </InlineRow>
                </GroupContent>
              </DataItem>
            ))}
          </DataList>
        ) : (
          <EmptyState>
            No documents associated with this asset. Documents can include
            prospectuses, legal agreements, and other important files.
          </EmptyState>
        )}
      </SectionContent>
    </TabSection>
  );
};
