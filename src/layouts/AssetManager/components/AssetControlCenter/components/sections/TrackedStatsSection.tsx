import type { TrustedFor } from '@polymeshassociation/polymesh-sdk/types';
import {
  ClaimType,
  TransferRestrictionStatValues,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useState } from 'react';
import { CopyToClipboard, Icon } from '~/components';
import { formatDid } from '~/helpers/formatters';
import { useAssetActionsContext } from '../../context';
import {
  ActionButton,
  AddButton,
  DataItem,
  EmptyState,
  GridDataList,
  GroupActions,
  GroupHeader,
  GroupTitleSection,
  InlineLabel,
  InlineRow,
  InlineValue,
  SectionHeader,
  SectionTitle,
  TabSection,
} from '../../styles';
import type { TabProps } from '../../types';
import { ComingSoonModal } from '../modals';

export const TrackedStatsSection: React.FC<TabProps> = ({ asset }) => {
  const { transactionInProcess } = useAssetActionsContext();
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  const trackedStatsWithValues = asset.details?.trackedStatistics || [];

  const getStatTypeDisplayName = (stat: TransferRestrictionStatValues) => {
    switch (stat.type) {
      case 'Count':
        return 'Holder Count';
      case 'Balance':
        return 'Total Holder Balance';
      case 'ScopedCount':
        return 'Claim Holder Count';
      case 'ScopedBalance':
        return 'Claim Holder Balance';
      default:
        return 'Unknown Type';
    }
  };

  const getStatKey = (stat: TransferRestrictionStatValues) => {
    if (stat.claim) {
      const { claimType, issuer } = stat.claim;
      const claimTypeKey =
        typeof claimType === 'object' && 'customClaimTypeId' in claimType
          ? `Custom-${claimType.customClaimTypeId.toString()}`
          : claimType;
      return `${stat.type}-${claimTypeKey}-${issuer.did}`;
    }
    return `${stat.type}`;
  };

  const formatClaimTypeForDisplay = (claimType: TrustedFor): string => {
    if (typeof claimType === 'object' && 'customClaimTypeId' in claimType) {
      return `Custom ID ${claimType.customClaimTypeId.toString()}`;
    }
    return claimType as string;
  };

  const handleAddTrackedStat = () => {
    setComingSoonFeature('add tracked stat');
    setComingSoonModalOpen(true);
  };

  const handleEditStat = () => {
    setComingSoonFeature('edit tracked stat');
    setComingSoonModalOpen(true);
  };

  const handleDeleteStat = () => {
    setComingSoonFeature('delete tracked stat');
    setComingSoonModalOpen(true);
  };

  function renderStatDetails(stat: TransferRestrictionStatValues) {
    const { claim, value } = stat;

    if (!claim) {
      return (
        <InlineRow>
          <InlineLabel>Current Value</InlineLabel>
          <InlineValue>{value.toString()}</InlineValue>
        </InlineRow>
      );
    }

    const { claimType } = claim;
    const claimValue = claim.value;

    const claimInfo = (
      <>
        <InlineRow>
          <InlineLabel>Claim Type</InlineLabel>
          <InlineValue>
            {formatClaimTypeForDisplay(claim.claimType)}
          </InlineValue>
        </InlineRow>
        <InlineRow>
          <InlineLabel>Claim Issuer</InlineLabel>
          <InlineValue>
            {formatDid(claim.issuer.did)}
            <CopyToClipboard value={claim.issuer.did} />
          </InlineValue>
        </InlineRow>
      </>
    );

    if (claimType === ClaimType.Jurisdiction && Array.isArray(claimValue)) {
      return (
        <>
          {claimInfo}
          {claimValue.length > 0 ? (
            claimValue.map((jv) => (
              <InlineRow key={jv.countryCode ?? 'no-jurisdiction'}>
                <InlineLabel>
                  {jv.countryCode
                    ? `Jurisdiction: ${jv.countryCode}`
                    : 'No Jurisdiction'}
                </InlineLabel>
                <InlineValue>{jv.value.toString()}</InlineValue>
              </InlineRow>
            ))
          ) : (
            <InlineRow>
              <InlineLabel>Current Value</InlineLabel>
              <InlineValue>No Tracked Holders</InlineValue>
            </InlineRow>
          )}
          <InlineRow>
            <InlineLabel>Combined Total</InlineLabel>
            <InlineValue>{value.toString()}</InlineValue>
          </InlineRow>
        </>
      );
    }

    if (claimValue && !Array.isArray(claimValue)) {
      return (
        <>
          {claimInfo}
          <InlineRow>
            <InlineLabel>With Claim</InlineLabel>
            <InlineValue>{claimValue.withClaim.toString()}</InlineValue>
          </InlineRow>
          <InlineRow>
            <InlineLabel>Without Claim</InlineLabel>
            <InlineValue>{claimValue.withoutClaim.toString()}</InlineValue>
          </InlineRow>
          <InlineRow>
            <InlineLabel>Combined Total</InlineLabel>
            <InlineValue>{value.toString()}</InlineValue>
          </InlineRow>
        </>
      );
    }

    // Other claim types without full chain support
    return (
      <>
        {claimInfo}
        <InlineRow>
          <InlineLabel>With Claim</InlineLabel>
          <InlineValue>Not Supported</InlineValue>
        </InlineRow>
        <InlineRow>
          <InlineLabel>Without Claim</InlineLabel>
          <InlineValue>Not Supported</InlineValue>
        </InlineRow>
        <InlineRow>
          <InlineLabel>Combined Total</InlineLabel>
          <InlineValue>{value.toString()}</InlineValue>
        </InlineRow>
      </>
    );
  }

  return (
    <>
      <TabSection>
        <SectionHeader>
          <SectionTitle>Tracked Stats</SectionTitle>
          <AddButton
            onClick={handleAddTrackedStat}
            disabled={transactionInProcess}
          >
            <Icon name="Plus" size="16px" />
            Add Tracked Stat
          </AddButton>
        </SectionHeader>

        <GridDataList>
          {trackedStatsWithValues.map((stat) => {
            const statKey = getStatKey(stat);
            const displayName = getStatTypeDisplayName(stat);

            return (
              <DataItem key={statKey}>
                <GroupHeader>
                  <GroupTitleSection>
                    <InlineRow>
                      <InlineLabel>Type</InlineLabel>
                      <InlineValue>{displayName}</InlineValue>
                    </InlineRow>
                  </GroupTitleSection>
                  <GroupActions>
                    <ActionButton
                      onClick={handleEditStat}
                      disabled={transactionInProcess}
                    >
                      <Icon name="Edit" size="14px" />
                    </ActionButton>
                    <ActionButton
                      onClick={handleDeleteStat}
                      disabled={transactionInProcess}
                    >
                      <Icon name="Delete" size="14px" />
                    </ActionButton>
                  </GroupActions>
                </GroupHeader>

                {renderStatDetails(stat)}
              </DataItem>
            );
          })}
        </GridDataList>

        {/* Show message when no stats are tracked */}
        {(!trackedStatsWithValues || trackedStatsWithValues.length === 0) && (
          <EmptyState>
            No statistics are currently being tracked for this asset.
          </EmptyState>
        )}
      </TabSection>

      <ComingSoonModal
        isOpen={comingSoonModalOpen}
        onClose={() => setComingSoonModalOpen(false)}
        feature={comingSoonFeature}
      />
    </>
  );
};
