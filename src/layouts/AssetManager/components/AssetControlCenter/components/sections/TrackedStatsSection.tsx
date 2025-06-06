import React from 'react';
import { Icon, CopyToClipboard } from '~/components';
import { formatDid } from '~/helpers/formatters';

import {
  TabSection,
  SectionHeader,
  SectionTitle,
  AddButton,
  GridDataList,
  DataItem,
  GroupHeader,
  GroupTitleSection,
  GroupActions,
  ActionButton,
  InlineRow,
  InlineLabel,
  InlineValue,
} from '../../styles';
import type { TabProps } from '../../types';

export const TrackedStatsSection: React.FC<TabProps> = ({ asset }) => {
  const {
    transferRestrictionCountStat,
    transferRestrictionPercentageStat,
    transferRestrictionClaimCountStat,
    transferRestrictionClaimPercentageStat,
  } = asset.details || {};

  // Placeholder handlers
  const handleAddTrackedStat = () => {
    // TODO: Implement add tracked stat logic
  };

  const handleEditStat = () => {
    // TODO: Implement edit stat logic
  };

  const handleDeleteStat = () => {
    // TODO: Implement delete stat logic
  };

  return (
    <TabSection>
      <SectionHeader>
        <SectionTitle>Tracked Stats</SectionTitle>
        <AddButton onClick={handleAddTrackedStat}>
          <Icon name="Plus" size="16px" />
          Add Tracked Stat
        </AddButton>
      </SectionHeader>

      <GridDataList>
        {/* Count Stat */}
        {transferRestrictionCountStat?.isSet && (
          <DataItem>
            <GroupHeader>
              <GroupTitleSection>
                <InlineRow>
                  <InlineLabel>Type</InlineLabel>
                  <InlineValue>Holder Count</InlineValue>
                </InlineRow>
              </GroupTitleSection>
              <GroupActions>
                <ActionButton onClick={handleEditStat}>
                  <Icon name="Edit" size="14px" />
                </ActionButton>
                <ActionButton onClick={handleDeleteStat}>
                  <Icon name="Delete" size="14px" />
                </ActionButton>
              </GroupActions>
            </GroupHeader>
            <InlineRow>
              <InlineLabel>Current Value</InlineLabel>
              <InlineValue>
                {/* TODO: Replace with actual value from SDK */}
                Loading...
              </InlineValue>
            </InlineRow>
          </DataItem>
        )}

        {/* Percentage Stat */}
        {transferRestrictionPercentageStat?.isSet && (
          <DataItem>
            <GroupHeader>
              <GroupTitleSection>
                <InlineRow>
                  <InlineLabel>Type</InlineLabel>
                  <InlineValue>Total Holder Balance</InlineValue>
                </InlineRow>
              </GroupTitleSection>
              <GroupActions>
                <ActionButton onClick={handleEditStat}>
                  <Icon name="Edit" size="14px" />
                </ActionButton>
                <ActionButton onClick={handleDeleteStat}>
                  <Icon name="Delete" size="14px" />
                </ActionButton>
              </GroupActions>
            </GroupHeader>
            <InlineRow>
              <InlineLabel>Current Value</InlineLabel>
              <InlineValue>
                {/* TODO: Replace with actual value from SDK */}
                Loading...
              </InlineValue>
            </InlineRow>
          </DataItem>
        )}

        {/* Claim Count Stats - individual cards for each tracked claim */}
        {transferRestrictionClaimCountStat?.isSet &&
          transferRestrictionClaimCountStat.claims?.map((claim) => {
            // For jurisdiction claims, we need to handle the jurisdiction code
            const isJurisdictionClaim =
              claim.claimType === 'Jurisdiction' && 'code' in claim;
            const jurisdictionCode = isJurisdictionClaim
              ? (claim as { code: string }).code
              : null;
            const keyBase = `claim-count-${claim.claimType}-${claim.issuer.did}`;
            const cardKey = jurisdictionCode
              ? `${keyBase}-${jurisdictionCode}`
              : keyBase;

            return (
              <DataItem key={cardKey}>
                <GroupHeader>
                  <GroupTitleSection>
                    <InlineRow>
                      <InlineLabel>Type</InlineLabel>
                      <InlineValue>Claim Holder Count</InlineValue>
                    </InlineRow>
                  </GroupTitleSection>
                  <GroupActions>
                    <ActionButton onClick={handleEditStat}>
                      <Icon name="Edit" size="14px" />
                    </ActionButton>
                    <ActionButton onClick={handleDeleteStat}>
                      <Icon name="Delete" size="14px" />
                    </ActionButton>
                  </GroupActions>
                </GroupHeader>
                <InlineRow>
                  <InlineLabel>Claim Type</InlineLabel>
                  <InlineValue>{claim.claimType}</InlineValue>
                </InlineRow>
                <InlineRow>
                  <InlineLabel>Claim Issuer</InlineLabel>
                  <InlineValue>
                    {formatDid(claim.issuer.did)}
                    <CopyToClipboard value={claim.issuer.did} />
                  </InlineValue>
                </InlineRow>
                {jurisdictionCode && (
                  <InlineRow>
                    <InlineLabel>Jurisdiction</InlineLabel>
                    <InlineValue>{jurisdictionCode}</InlineValue>
                  </InlineRow>
                )}
                <InlineRow>
                  <InlineLabel>With Claim</InlineLabel>
                  <InlineValue>
                    {/* TODO: Replace with actual value from SDK */}
                    Loading...
                  </InlineValue>
                </InlineRow>
                <InlineRow>
                  <InlineLabel>Without Claim</InlineLabel>
                  <InlineValue>
                    {/* TODO: Replace with actual value from SDK */}
                    Loading...
                  </InlineValue>
                </InlineRow>
              </DataItem>
            );
          })}

        {/* Claim Percentage Stats - individual cards for each tracked claim */}
        {transferRestrictionClaimPercentageStat?.isSet &&
          transferRestrictionClaimPercentageStat.claims?.map((claim) => {
            // For jurisdiction claims, we need to handle the jurisdiction code
            const isJurisdictionClaim =
              claim.claimType === 'Jurisdiction' && 'code' in claim;
            const jurisdictionCode = isJurisdictionClaim
              ? (claim as { code: string }).code
              : null;
            const keyBase = `claim-percentage-${claim.claimType}-${claim.issuer.did}`;
            const cardKey = jurisdictionCode
              ? `${keyBase}-${jurisdictionCode}`
              : keyBase;

            return (
              <DataItem key={cardKey}>
                <GroupHeader>
                  <GroupTitleSection>
                    <InlineRow>
                      <InlineLabel>Type</InlineLabel>
                      <InlineValue>Claim Holder Balance</InlineValue>
                    </InlineRow>
                  </GroupTitleSection>
                  <GroupActions>
                    <ActionButton onClick={handleEditStat}>
                      <Icon name="Edit" size="14px" />
                    </ActionButton>
                    <ActionButton onClick={handleDeleteStat}>
                      <Icon name="Delete" size="14px" />
                    </ActionButton>
                  </GroupActions>
                </GroupHeader>
                <InlineRow>
                  <InlineLabel>Claim Type</InlineLabel>
                  <InlineValue>{claim.claimType}</InlineValue>
                </InlineRow>
                <InlineRow>
                  <InlineLabel>Claim Issuer</InlineLabel>
                  <InlineValue>
                    {formatDid(claim.issuer.did)}
                    <CopyToClipboard value={claim.issuer.did} />
                  </InlineValue>
                </InlineRow>
                {jurisdictionCode && (
                  <InlineRow>
                    <InlineLabel>Jurisdiction</InlineLabel>
                    <InlineValue>{jurisdictionCode}</InlineValue>
                  </InlineRow>
                )}
                <InlineRow>
                  <InlineLabel>With Claim</InlineLabel>
                  <InlineValue>
                    {/* TODO: Replace with actual value from SDK */}
                    Loading...
                  </InlineValue>
                </InlineRow>
                <InlineRow>
                  <InlineLabel>Without Claim</InlineLabel>
                  <InlineValue>
                    {/* TODO: Replace with actual value from SDK */}
                    Loading...
                  </InlineValue>
                </InlineRow>
              </DataItem>
            );
          })}

        {/* Show fallback cards if claim stats are tracked but no claims configured */}
        {transferRestrictionClaimCountStat?.isSet &&
          (!transferRestrictionClaimCountStat.claims ||
            transferRestrictionClaimCountStat.claims.length === 0) && (
            <DataItem>
              <GroupHeader>
                <GroupTitleSection>
                  <InlineRow>
                    <InlineLabel>Type</InlineLabel>
                    <InlineValue>Holder Count (Claim-based)</InlineValue>
                  </InlineRow>
                </GroupTitleSection>
                <GroupActions>
                  <ActionButton onClick={handleEditStat}>
                    <Icon name="Edit" size="14px" />
                  </ActionButton>
                  <ActionButton onClick={handleDeleteStat}>
                    <Icon name="Delete" size="14px" />
                  </ActionButton>
                </GroupActions>
              </GroupHeader>
              <InlineRow>
                <InlineLabel>Status</InlineLabel>
                <InlineValue>
                  Tracking enabled, no specific claims configured
                </InlineValue>
              </InlineRow>
            </DataItem>
          )}

        {transferRestrictionClaimPercentageStat?.isSet &&
          (!transferRestrictionClaimPercentageStat.claims ||
            transferRestrictionClaimPercentageStat.claims.length === 0) && (
            <DataItem>
              <GroupHeader>
                <GroupTitleSection>
                  <InlineRow>
                    <InlineLabel>Type</InlineLabel>
                    <InlineValue>
                      Total Percentage Ownership (Claim-based)
                    </InlineValue>
                  </InlineRow>
                </GroupTitleSection>
                <GroupActions>
                  <ActionButton onClick={handleEditStat}>
                    <Icon name="Edit" size="14px" />
                  </ActionButton>
                  <ActionButton onClick={handleDeleteStat}>
                    <Icon name="Delete" size="14px" />
                  </ActionButton>
                </GroupActions>
              </GroupHeader>
              <InlineRow>
                <InlineLabel>Status</InlineLabel>
                <InlineValue>
                  Tracking enabled, no specific claims configured
                </InlineValue>
              </InlineRow>
            </DataItem>
          )}
      </GridDataList>

      {/* Show message when no stats are tracked */}
      {!transferRestrictionCountStat?.isSet &&
        !transferRestrictionPercentageStat?.isSet &&
        !transferRestrictionClaimCountStat?.isSet &&
        !transferRestrictionClaimPercentageStat?.isSet && (
          <p>No statistics are currently being tracked for this asset.</p>
        )}
    </TabSection>
  );
};
