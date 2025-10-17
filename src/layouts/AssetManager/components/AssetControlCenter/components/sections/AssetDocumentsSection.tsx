import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { AssetDocument } from '@polymeshassociation/polymesh-sdk/types';
import React, { useMemo, useState } from 'react';
import { ConfirmationModal, Icon, SafeLink } from '~/components';
import { useAssetActionsContext } from '../../context';
import {
  ActionButton,
  AddButton,
  DataItem,
  DataList,
  EmptyState,
  GroupActions,
  GroupContent,
  GroupHeader,
  GroupTitleSection,
  HeaderButtons,
  InlineLabel,
  InlineRow,
  InlineValue,
  SectionContent,
  SectionHeader,
  SectionTitle,
  TabSection,
} from '../../styles';
import type { TabProps } from '../../types';
import { AddDocumentModal } from '../modals';

interface AssetDocumentsSectionProps {
  asset: TabProps['asset'];
}

export const AssetDocumentsSection: React.FC<AssetDocumentsSectionProps> = ({
  asset,
}) => {
  const { addAssetDocument, removeAssetDocuments, transactionInProcess } =
    useAssetActionsContext();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);
  const [documentIdToDelete, setDocumentIdToDelete] = useState<string | null>(
    null,
  );

  const handleAddDocument = () => {
    setAddModalOpen(true);
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocumentIdToDelete(documentId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteDocument = async () => {
    if (documentIdToDelete) {
      await removeAssetDocuments({
        documentIds: [new BigNumber(documentIdToDelete)],
      });
    }
  };

  const handleDeleteAllDocuments = () => {
    if (!asset?.docs || asset.docs.length === 0) return;
    setDeleteAllConfirmOpen(true);
  };

  const confirmDeleteAllDocuments = async () => {
    if (!asset?.docs || asset.docs.length === 0) return;

    // Extract all document IDs and remove them in a single transaction
    const allDocumentIds = asset.docs.map((doc) => doc.id);
    await removeAssetDocuments({
      documentIds: allDocumentIds,
    });
  };

  // Display documents with on-chain IDs, sorted by ID
  const displayDocuments = useMemo(
    () =>
      asset?.docs
        ?.sort((a, b) => a.id.comparedTo(b.id))
        .map((doc) => ({
          id: doc.id.toString(),
          name: doc.name,
          type: doc.type || 'Document',
          contentHash: doc.contentHash || undefined,
          filedAt: doc.filedAt || new Date(),
          uri: doc.uri || '',
        })) || [],
    [asset?.docs],
  );

  const handleAddDocumentSubmit = async (
    document: AssetDocument,
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    await addAssetDocument({
      document,
      onTransactionRunning,
    });
  };

  return (
    <>
      <TabSection>
        <SectionHeader>
          <SectionTitle>Asset Documents</SectionTitle>
          <HeaderButtons>
            <AddButton
              onClick={handleAddDocument}
              disabled={transactionInProcess}
            >
              <Icon name="Plus" size="16px" />
              Add Document
            </AddButton>
            {displayDocuments.length > 1 && (
              <AddButton
                onClick={handleDeleteAllDocuments}
                disabled={transactionInProcess}
              >
                <Icon name="Delete" size="16px" />
                Delete All
              </AddButton>
            )}
          </HeaderButtons>
        </SectionHeader>
        <SectionContent>
          {displayDocuments.length > 0 ? (
            <DataList className="two-column">
              {displayDocuments.map((document) => (
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
                        onClick={() => handleDeleteDocument(document.id)}
                        disabled={transactionInProcess}
                      >
                        <Icon name="Delete" size="14px" />
                      </ActionButton>
                    </GroupActions>
                  </GroupHeader>

                  {/* Content section */}
                  <GroupContent>
                    <InlineRow>
                      <InlineLabel>Document ID</InlineLabel>
                      <InlineValue>{document.id}</InlineValue>
                    </InlineRow>

                    <InlineRow>
                      <InlineLabel>Type</InlineLabel>
                      <InlineValue>{document.type}</InlineValue>
                    </InlineRow>

                    <InlineRow>
                      <InlineLabel>URI</InlineLabel>
                      <InlineValue>
                        {document.uri ? (
                          <SafeLink href={document.uri}>
                            {document.uri}
                          </SafeLink>
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

      <AddDocumentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddDocument={handleAddDocumentSubmit}
        transactionInProcess={transactionInProcess}
      />

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDocumentIdToDelete(null);
        }}
        onConfirm={confirmDeleteDocument}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmLabel="Delete Document"
        isProcessing={transactionInProcess}
      />

      <ConfirmationModal
        isOpen={deleteAllConfirmOpen}
        onClose={() => setDeleteAllConfirmOpen(false)}
        onConfirm={confirmDeleteAllDocuments}
        title="Delete All Documents"
        message="Are you sure you want to delete all documents? This will remove all documents associated with this asset. This action cannot be undone."
        confirmLabel="Delete All"
        isProcessing={transactionInProcess}
      />
    </>
  );
};
