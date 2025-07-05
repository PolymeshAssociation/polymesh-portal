import React, { useState } from 'react';
import { Icon } from '~/components';
import { ComingSoonModal } from '../modals';
import { useAssetActionsContext } from '../../context';
import type { TabProps, AssetMetadata } from '../../types';
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

interface AssetMetadataSectionProps {
  asset: TabProps['asset'];
}

export const AssetMetadataSection: React.FC<AssetMetadataSectionProps> = ({
  asset,
}) => {
  const { transactionInProcess } = useAssetActionsContext();
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  const handleAddMetadata = () => {
    setComingSoonFeature('add asset metadata');
    setComingSoonModalOpen(true);
  };

  const handleEditMetadata = (metadataId: string) => {
    setComingSoonFeature('edit asset metadata');
    setComingSoonModalOpen(true);
    // eslint-disable-next-line no-console
    console.log('Edit metadata:', metadataId);
  };

  const handleDeleteMetadata = (metadataId: string) => {
    setComingSoonFeature('delete asset metadata');
    setComingSoonModalOpen(true);
    // eslint-disable-next-line no-console
    console.log('Delete metadata:', metadataId);
  };

  // Extract metadata from asset data
  const assetMetadata: AssetMetadata[] =
    asset?.details?.metaData?.map((meta, index) => {
      let expiryValue: string | undefined;
      if (meta.expiry) {
        expiryValue =
          typeof meta.expiry === 'string'
            ? meta.expiry
            : meta.expiry.toISOString();
      }

      return {
        id: `metadata-${meta.name}-${index}`,
        key: meta.name,
        value: meta.value || '',
        details: meta.description,
        expiry: expiryValue,
        lockStatus: meta.isLocked ? 'Locked' : undefined,
        lockedUntil: meta.lockedUntil,
      };
    }) || [];

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
          {assetMetadata.length > 0 ? (
            <DataList className="two-column">
              {assetMetadata.map((metadata) => (
                <DataItem key={metadata.id}>
                  {/* Header with metadata key and action buttons */}
                  <GroupHeader>
                    <GroupTitleSection>
                      <InlineRow>
                        <InlineLabel>Key</InlineLabel>
                        <InlineValue>{metadata.key}</InlineValue>
                      </InlineRow>
                    </GroupTitleSection>

                    {/* Action buttons in top-right corner */}
                    <GroupActions>
                      <ActionButton
                        onClick={() => handleEditMetadata(metadata.id)}
                        disabled={transactionInProcess}
                      >
                        <Icon name="Edit" size="14px" />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDeleteMetadata(metadata.id)}
                        disabled={transactionInProcess}
                      >
                        <Icon name="Delete" size="14px" />
                      </ActionButton>
                    </GroupActions>
                  </GroupHeader>

                  {/* Content section */}
                  <GroupContent>
                    <InlineRow>
                      <InlineLabel>Value</InlineLabel>
                      <InlineValue>
                        {metadata.value.startsWith('http') ? (
                          <a
                            href={metadata.value}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {metadata.value}
                          </a>
                        ) : (
                          metadata.value
                        )}
                      </InlineValue>
                    </InlineRow>

                    {metadata.details && (
                      <InlineRow>
                        <InlineLabel>Description</InlineLabel>
                        <InlineValue>{metadata.details}</InlineValue>
                      </InlineRow>
                    )}

                    {metadata.expiry && (
                      <InlineRow>
                        <InlineLabel>Expires</InlineLabel>
                        <InlineValue>{metadata.expiry}</InlineValue>
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
                          {metadata.lockStatus === 'Locked' && (
                            <>
                              <Icon name="LockIcon" size="14px" />
                              Locked Permanently
                            </>
                          )}
                          {metadata.lockStatus === 'Locked Until' &&
                            metadata.lockedUntil && (
                              <>
                                <Icon name="LockIcon" size="14px" />
                                Locked Until {metadata.lockedUntil}
                              </>
                            )}
                          {metadata.lockStatus &&
                            metadata.lockStatus !== 'Locked' &&
                            metadata.lockStatus !== 'Locked Until' &&
                            metadata.lockStatus}
                        </InlineValue>
                      </InlineRow>
                    )}
                  </GroupContent>
                </DataItem>
              ))}
            </DataList>
          ) : (
            <EmptyState>
              No metadata entries for this asset. Metadata provides additional
              structured information about your asset.
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
