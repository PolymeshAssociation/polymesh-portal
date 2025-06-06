import React from 'react';
import type { TabProps } from '../../types';
import {
  TabSection,
  SectionHeader,
  SectionTitle,
  SectionContent,
  DataList,
  DataItem,
  EmptyState,
  GroupContent,
  InlineRow,
  InlineLabel,
  InlineValue,
  InfoText,
} from '../../styles';

interface NftCollectionKeysSectionProps {
  asset: TabProps['asset'];
}

export const NftCollectionKeysSection: React.FC<
  NftCollectionKeysSectionProps
> = ({ asset }) => {
  // Only show this section for NFT collections
  if (!asset?.details?.isNftCollection) {
    return null;
  }

  const collectionKeys = asset?.details?.collectionKeys || [];

  return (
    <TabSection>
      <SectionHeader>
        <SectionTitle>Collection Keys</SectionTitle>
      </SectionHeader>
      <SectionContent>
        <InfoText>
          Collection keys define the properties that every NFT in this
          collection must have. These keys are set when the collection is
          created and cannot be modified.
        </InfoText>
        {collectionKeys.length > 0 ? (
          <DataList className="two-column">
            {collectionKeys.map((key) => (
              <DataItem key={key.id.toString()}>
                <GroupContent>
                  <InlineRow>
                    <InlineLabel>Key Name</InlineLabel>
                    <InlineValue>{key.name}</InlineValue>
                  </InlineRow>

                  <InlineRow>
                    <InlineLabel>Type</InlineLabel>
                    <InlineValue>{key.type}</InlineValue>
                  </InlineRow>

                  <InlineRow>
                    <InlineLabel>Key ID</InlineLabel>
                    <InlineValue>{key.id.toString()}</InlineValue>
                  </InlineRow>

                  {key.specs?.description && (
                    <InlineRow>
                      <InlineLabel>Description</InlineLabel>
                      <InlineValue>{key.specs.description}</InlineValue>
                    </InlineRow>
                  )}

                  {key.specs?.url && (
                    <InlineRow>
                      <InlineLabel>URL</InlineLabel>
                      <InlineValue>
                        <a
                          href={key.specs.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {key.specs.url}
                        </a>
                      </InlineValue>
                    </InlineRow>
                  )}

                  {key.specs?.typeDef && (
                    <InlineRow>
                      <InlineLabel>Type Definition</InlineLabel>
                      <InlineValue>{key.specs.typeDef}</InlineValue>
                    </InlineRow>
                  )}
                </GroupContent>
              </DataItem>
            ))}
          </DataList>
        ) : (
          <EmptyState>
            No collection keys defined. Collection keys define the properties
            that each NFT in this collection must have.
          </EmptyState>
        )}
      </SectionContent>
    </TabSection>
  );
};
