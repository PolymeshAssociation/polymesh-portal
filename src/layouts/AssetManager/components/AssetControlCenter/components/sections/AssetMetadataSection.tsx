import {
  CollectionKey,
  MetadataEntry,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useMemo, useState } from 'react';
import { ConfirmationModal, Icon, SafeLink } from '~/components';
import type { AssetMetadata } from '~/context/AssetContext/constants';
import { toFormattedTimestamp } from '~/helpers/dateTime';
import { splitCamelCase } from '~/helpers/formatters';
import { useAssetActionsContext } from '../../context';
import {
  ActionButton,
  AddButton,
  CollectionKeyBadge,
  DataItem,
  DataList,
  EmptyState,
  FilterCheckbox,
  FilterContainer,
  FilterLabel,
  GroupActions,
  GroupContent,
  GroupHeader,
  GroupTitleSection,
  InlineLabel,
  InlineRow,
  InlineValue,
  SectionContent,
  SectionHeader,
  SectionTitle,
  TabSection,
} from '../../styles';
import type { TabProps } from '../../types';
import { AddMetadataModal, EditMetadataModal } from '../modals';

interface MetadataItemProps {
  metadata: AssetMetadata;
  transactionInProcess: boolean;
  showExtendedDetails: boolean;
  collectionKeys?: CollectionKey[];
  onEdit: (entry: MetadataEntry) => void;
  onClear: (entry: MetadataEntry) => void;
  onRemove: (entry: MetadataEntry) => void;
}

const MetadataItem: React.FC<MetadataItemProps> = ({
  metadata,
  transactionInProcess,
  showExtendedDetails,
  collectionKeys,
  onEdit,
  onClear,
  onRemove,
}) => {
  // Determine if metadata is a collection key
  const isCollectionKey = useMemo(() => {
    if (!collectionKeys) return false;
    return collectionKeys.some(
      (key) =>
        key.type === metadata.entry.type &&
        key.id.toString() === metadata.entry.id.toString(),
    );
  }, [collectionKeys, metadata.entry.type, metadata.entry.id]);

  // Determine if metadata is locked
  const isLocked = useMemo(() => {
    if (!metadata.lockStatus) return false;
    if (metadata.lockStatus === 'Locked') return true;
    if (metadata.lockStatus === 'LockedUntil' && metadata.lockedUntil) {
      return new Date() < metadata.lockedUntil;
    }
    return false;
  }, [metadata.lockStatus, metadata.lockedUntil]);

  // Determine the delete button title
  const deleteButtonTitle = useMemo(() => {
    if (isCollectionKey) {
      return 'Cannot remove - this is an NFT collection key';
    }
    if (isLocked) {
      return 'Cannot remove - metadata is locked';
    }
    return 'Remove metadata key';
  }, [isCollectionKey, isLocked]);

  return (
    <DataItem>
      {/* Header section */}
      <GroupHeader>
        <GroupTitleSection>
          <InlineRow>
            <InlineLabel>Key Name</InlineLabel>
            <InlineValue>
              {splitCamelCase(metadata.details.name)}
              {isCollectionKey && (
                <CollectionKeyBadge>NFT Key</CollectionKeyBadge>
              )}
            </InlineValue>
          </InlineRow>
        </GroupTitleSection>

        <GroupActions>
          <ActionButton
            onClick={() => onEdit(metadata.entry)}
            disabled={transactionInProcess || isLocked}
            title={
              isLocked
                ? 'Cannot edit - metadata is locked'
                : 'Edit metadata value'
            }
          >
            <Icon name="Edit" size="14px" />
          </ActionButton>
          {metadata.value && (
            <ActionButton
              onClick={() => onClear(metadata.entry)}
              disabled={transactionInProcess || isLocked}
              title={
                isLocked
                  ? 'Cannot clear - metadata is locked'
                  : 'Clear metadata value'
              }
            >
              <Icon name="CloseIcon" size="14px" />
            </ActionButton>
          )}
          {metadata.entry.type === 'Local' && (
            <ActionButton
              onClick={() => onRemove(metadata.entry)}
              disabled={transactionInProcess || isLocked || isCollectionKey}
              title={deleteButtonTitle}
            >
              <Icon name="Delete" size="14px" />
            </ActionButton>
          )}
        </GroupActions>
      </GroupHeader>

      {/* Content section */}
      <GroupContent>
        <InlineRow>
          <InlineLabel>Value</InlineLabel>
          <InlineValue>
            {(() => {
              if (!metadata.value) {
                return <em style={{ opacity: 0.6 }}>No value set</em>;
              }
              if (metadata.value.startsWith('http')) {
                return (
                  <SafeLink href={metadata.value}>{metadata.value}</SafeLink>
                );
              }
              return metadata.value;
            })()}
          </InlineValue>
        </InlineRow>

        {showExtendedDetails && (
          <>
            <InlineRow>
              <InlineLabel>ID</InlineLabel>
              <InlineValue>
                {metadata.entry.type} - {metadata.entry.id.toString()}
              </InlineValue>
            </InlineRow>

            {metadata.details.specs?.description && (
              <InlineRow>
                <InlineLabel>Description</InlineLabel>
                <InlineValue>{metadata.details.specs.description}</InlineValue>
              </InlineRow>
            )}

            {metadata.details.specs?.url && (
              <InlineRow>
                <InlineLabel>URL</InlineLabel>
                <InlineValue>
                  <SafeLink href={metadata.details.specs.url}>
                    {metadata.details.specs.url}
                  </SafeLink>
                </InlineValue>
              </InlineRow>
            )}

            {metadata.details.specs?.typeDef && (
              <InlineRow>
                <InlineLabel>Type Definition</InlineLabel>
                <InlineValue>{metadata.details.specs.typeDef}</InlineValue>
              </InlineRow>
            )}

            {metadata.expiry && (
              <InlineRow>
                <InlineLabel>Expires</InlineLabel>
                <InlineValue>
                  {toFormattedTimestamp(
                    metadata.expiry,
                    'YYYY-MM-DD / HH:mm:ss',
                  )}
                </InlineValue>
              </InlineRow>
            )}

            {metadata.lockStatus && (
              <InlineRow>
                <InlineLabel>Lock Status</InlineLabel>
                <InlineValue
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {metadata.lockStatus === 'LockedUntil' && metadata.lockedUntil
                    ? `Locked Until ${toFormattedTimestamp(metadata.lockedUntil, 'YYYY-MM-DD / HH:mm:ss')}`
                    : splitCamelCase(metadata.lockStatus)}
                </InlineValue>
              </InlineRow>
            )}
          </>
        )}
      </GroupContent>
    </DataItem>
  );
};

interface AssetMetadataSectionProps {
  asset: TabProps['asset'];
}

export const AssetMetadataSection: React.FC<AssetMetadataSectionProps> = ({
  asset,
}) => {
  const {
    transactionInProcess,
    registerMetadata,
    setMetadata,
    clearMetadata,
    removeMetadata,
  } = useAssetActionsContext();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [metadataEntryToEdit, setMetadataEntryToEdit] =
    useState<MetadataEntry | null>(null);
  const [showWithoutValues, setShowWithoutValues] = useState(false);
  const [showExtendedDetails, setShowExtendedDetails] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [metadataEntryForAction, setMetadataEntryForAction] =
    useState<MetadataEntry | null>(null);

  // Check if there are any local metadata entries without values
  const hasEntriesWithoutValues = useMemo(() => {
    if (!asset?.details?.metadata) return false;

    return asset.details.metadata.some((meta) => !meta.value);
  }, [asset?.details?.metadata]);

  // Filter metadata: always exclude global types without values
  const filteredMetadata = useMemo(() => {
    if (!asset?.details?.metadata) return [];

    return asset.details.metadata.filter((meta) => {
      const hasValue = !!meta.value;

      if (!hasValue && !showWithoutValues) {
        return false;
      }

      return true;
    });
  }, [asset?.details?.metadata, showWithoutValues]);

  const handleAddMetadata = () => {
    setAddModalOpen(true);
  };

  const handleEditMetadata = (metadataEntry: MetadataEntry) => {
    setMetadataEntryToEdit(metadataEntry);
    setEditModalOpen(true);
  };

  const handleClearMetadata = (metadataEntry: MetadataEntry) => {
    setMetadataEntryForAction(metadataEntry);
    setClearConfirmOpen(true);
  };

  const confirmClearMetadata = async () => {
    if (metadataEntryForAction) {
      await clearMetadata({ metadataEntry: metadataEntryForAction });
      setMetadataEntryForAction(null);
    }
  };

  const handleRemoveMetadata = (metadataEntry: MetadataEntry) => {
    setMetadataEntryForAction(metadataEntry);
    setRemoveConfirmOpen(true);
  };

  const confirmRemoveMetadata = async () => {
    if (metadataEntryForAction) {
      await removeMetadata({ metadataEntry: metadataEntryForAction });
      setMetadataEntryForAction(null);
    }
  };

  return (
    <>
      <TabSection>
        <SectionHeader>
          <SectionTitle>Asset Metadata</SectionTitle>

          <AddButton
            onClick={handleAddMetadata}
            disabled={transactionInProcess}
          >
            <Icon name="Plus" size="16px" />
            Add Metadata
          </AddButton>
        </SectionHeader>
        <SectionContent>
          {!!asset?.details?.metadata && asset.details.metadata.length > 0 && (
            <FilterContainer>
              {hasEntriesWithoutValues && (
                <FilterLabel htmlFor="show-without-values">
                  <FilterCheckbox
                    id="show-without-values"
                    checked={showWithoutValues}
                    onChange={() => setShowWithoutValues(!showWithoutValues)}
                  />
                  <span>Show entries without values</span>
                </FilterLabel>
              )}
              {filteredMetadata.length > 0 && (
                <FilterLabel htmlFor="show-extended-details">
                  <FilterCheckbox
                    id="show-extended-details"
                    checked={showExtendedDetails}
                    onChange={() =>
                      setShowExtendedDetails(!showExtendedDetails)
                    }
                  />
                  <span>Show extended details</span>
                </FilterLabel>
              )}
            </FilterContainer>
          )}

          {filteredMetadata.length === 0 &&
          !!asset?.details?.metadata &&
          asset.details.metadata.length > 0 ? (
            <EmptyState>
              No metadata entries match the current filter.
            </EmptyState>
          ) : null}

          {filteredMetadata.length > 0 ? (
            <DataList className="two-column">
              {filteredMetadata.map((meta) => (
                <MetadataItem
                  key={`metadata-${meta.entry.type}-${meta.entry.id}`}
                  metadata={meta}
                  transactionInProcess={transactionInProcess}
                  showExtendedDetails={showExtendedDetails}
                  collectionKeys={asset?.details?.collectionKeys}
                  onEdit={handleEditMetadata}
                  onClear={handleClearMetadata}
                  onRemove={handleRemoveMetadata}
                />
              ))}
            </DataList>
          ) : null}

          {!asset?.details?.metadata || asset.details.metadata.length === 0 ? (
            <EmptyState>
              No metadata entries for this asset. Metadata provides additional
              structured information about your asset.
            </EmptyState>
          ) : null}
        </SectionContent>
      </TabSection>

      <AddMetadataModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onRegisterMetadata={registerMetadata}
        onSetMetadata={setMetadata}
        transactionInProcess={transactionInProcess}
      />

      <EditMetadataModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setMetadataEntryToEdit(null);
        }}
        metadataEntry={metadataEntryToEdit}
        onSetMetadata={setMetadata}
        transactionInProcess={transactionInProcess}
      />

      <ConfirmationModal
        isOpen={clearConfirmOpen}
        onClose={() => {
          setClearConfirmOpen(false);
          setMetadataEntryForAction(null);
        }}
        onConfirm={confirmClearMetadata}
        title="Clear Metadata Value"
        message="Are you sure you want to clear this metadata value? The key will remain but the value will be removed."
        confirmLabel="Clear Value"
        isProcessing={transactionInProcess}
      />

      <ConfirmationModal
        isOpen={removeConfirmOpen}
        onClose={() => {
          setRemoveConfirmOpen(false);
          setMetadataEntryForAction(null);
        }}
        onConfirm={confirmRemoveMetadata}
        title="Remove Metadata Key"
        message="Are you sure you want to remove this metadata key? This will delete both the key and value. This action cannot be undone."
        confirmLabel="Remove Key"
        isProcessing={transactionInProcess}
      />
    </>
  );
};
