import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import type {
  AddBalanceStatParams,
  AddClaimBalanceStatParams,
  AddClaimCountStatParams,
  AddCountStatParams,
  CountryCode,
  StatType,
  TrustedFor,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  ClaimType,
  TransferRestrictionStatValues,
} from '@polymeshassociation/polymesh-sdk/types';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ConfirmationModal, CopyToClipboard, Icon } from '~/components';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { PolymeshContext } from '~/context/PolymeshContext';
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
import { AddTrackedStatModal, EditTrackedStatModal } from '../modals';

export const TrackedStatsSection: React.FC<TabProps> = ({ asset }) => {
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);
  const { setTransferRestrictionStats, transactionInProcess } =
    useAssetActionsContext();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [statToEdit, setStatToEdit] =
    useState<TransferRestrictionStatValues | null>(null);
  const [statToDelete, setStatToDelete] =
    useState<TransferRestrictionStatValues | null>(null);
  const [maxStatsPerAsset, setMaxStatsPerAsset] = useState<number | null>(null);

  const countryLookup = useMemo(
    () => new Map(countryCodes.map((c) => [c.code, c.name])),
    [],
  );

  // Fetch max stats per asset from chain
  useEffect(() => {
    const fetchMaxStats = () => {
      if (!polkadotApi) return;

      try {
        const max = polkadotApi.consts.statistics.maxStatsPerAsset;
        setMaxStatsPerAsset(max.toNumber());
      } catch (error) {
        // Fallback if query fails
        setMaxStatsPerAsset(null);
      }
    };

    fetchMaxStats();
  }, [polkadotApi]);

  const trackedStatsWithValues = useMemo(() => {
    return asset.details?.trackedStatistics || [];
  }, [asset.details?.trackedStatistics]);

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
    setAddModalOpen(true);
  };

  const handleEditStat = (stat: TransferRestrictionStatValues) => {
    setStatToEdit(stat);
    setEditModalOpen(true);
  };

  const handleDeleteStat = (stat: TransferRestrictionStatValues) => {
    setStatToDelete(stat);
    setDeleteConfirmOpen(true);
  };

  // Helper function to convert stat values back to params for setStats
  const convertStatToParams = (
    stat: TransferRestrictionStatValues,
    includeValues = true,
  ):
    | AddCountStatParams
    | AddBalanceStatParams
    | AddClaimCountStatParams
    | AddClaimBalanceStatParams => {
    if (stat.type === 'Count') {
      return {
        type: 'Count' as StatType.Count,
        count: includeValues ? stat.value : undefined,
      };
    }

    if (stat.type === 'Balance') {
      return {
        type: 'Balance' as StatType.Balance,
        balance: includeValues ? stat.value : undefined,
      };
    }

    if (stat.type === 'ScopedCount' && stat.claim) {
      const { issuer, claimType, value } = stat.claim;

      if (claimType === ClaimType.Accredited) {
        const claimValue = includeValues
          ? (value as
              | { withClaim: BigNumber; withoutClaim: BigNumber }
              | undefined)
          : undefined;
        return {
          type: 'ScopedCount' as StatType.ScopedCount,
          issuer,
          claimType: ClaimType.Accredited,
          value: claimValue
            ? {
                accredited: claimValue.withClaim,
                nonAccredited: claimValue.withoutClaim,
              }
            : undefined,
        };
      }

      if (claimType === ClaimType.Affiliate) {
        const claimValue = includeValues
          ? (value as
              | { withClaim: BigNumber; withoutClaim: BigNumber }
              | undefined)
          : undefined;
        return {
          type: 'ScopedCount' as StatType.ScopedCount,
          issuer,
          claimType: ClaimType.Affiliate,
          value: claimValue
            ? {
                affiliate: claimValue.withClaim,
                nonAffiliate: claimValue.withoutClaim,
              }
            : undefined,
        };
      }

      if (claimType === ClaimType.Jurisdiction) {
        const claimValue = includeValues
          ? (value as { countryCode: string; value: BigNumber }[] | undefined)
          : undefined;
        return {
          type: 'ScopedCount' as StatType.ScopedCount,
          issuer,
          claimType: ClaimType.Jurisdiction,
          value: claimValue
            ? claimValue.map((jv) => ({
                countryCode: jv.countryCode as CountryCode | undefined,
                count: jv.value,
              }))
            : undefined,
        };
      }
    }

    if (stat.type === 'ScopedBalance' && stat.claim) {
      const { issuer, claimType, value } = stat.claim;

      if (claimType === ClaimType.Accredited) {
        const claimValue = includeValues
          ? (value as
              | { withClaim: BigNumber; withoutClaim: BigNumber }
              | undefined)
          : undefined;
        return {
          type: 'ScopedBalance' as StatType.ScopedBalance,
          issuer,
          claimType: ClaimType.Accredited,
          value: claimValue
            ? {
                accredited: claimValue.withClaim,
                nonAccredited: claimValue.withoutClaim,
              }
            : undefined,
        };
      }

      if (claimType === ClaimType.Affiliate) {
        const claimValue = includeValues
          ? (value as
              | { withClaim: BigNumber; withoutClaim: BigNumber }
              | undefined)
          : undefined;
        return {
          type: 'ScopedBalance' as StatType.ScopedBalance,
          issuer,
          claimType: ClaimType.Affiliate,
          value: claimValue
            ? {
                affiliate: claimValue.withClaim,
                nonAffiliate: claimValue.withoutClaim,
              }
            : undefined,
        };
      }

      if (claimType === ClaimType.Jurisdiction) {
        const claimValue = includeValues
          ? (value as { countryCode: string; value: BigNumber }[] | undefined)
          : undefined;
        return {
          type: 'ScopedBalance' as StatType.ScopedBalance,
          issuer,
          claimType: ClaimType.Jurisdiction,
          value: claimValue
            ? claimValue.map((jv) => ({
                countryCode: jv.countryCode as CountryCode | undefined,
                balance: jv.value,
              }))
            : undefined,
        };
      }
    }

    // Fallback (should never reach here if types are correct)
    throw new Error(
      `Unsupported stat type: ${stat.type}${stat.claim ? ` with claim type ${stat.claim.claimType}` : ''}`,
    );
  };

  const handleAddStatSubmit = async ({
    stat,
    onTransactionRunning,
  }: {
    stat:
      | AddCountStatParams
      | AddBalanceStatParams
      | AddClaimCountStatParams
      | AddClaimBalanceStatParams;
    onTransactionRunning?: () => void | Promise<void>;
  }) => {
    // Get all existing stats (without values) and add the new one (with values if provided)
    const allStats = [
      ...trackedStatsWithValues.map((s) => convertStatToParams(s, false)),
      stat,
    ];

    await setTransferRestrictionStats({
      stats: allStats,
      onTransactionRunning,
    });
  };

  const handleEditStatSubmit = async ({
    stat,
    onTransactionRunning,
  }: {
    stat:
      | AddCountStatParams
      | AddBalanceStatParams
      | AddClaimCountStatParams
      | AddClaimBalanceStatParams;
    onTransactionRunning?: () => void | Promise<void>;
  }) => {
    if (!statToEdit) return;

    // Replace the old stat with the updated one - only pass values for the stat being edited
    const allStats = trackedStatsWithValues
      .filter((s) => s !== statToEdit)
      .map((s) => convertStatToParams(s, false))
      .concat([stat]);

    await setTransferRestrictionStats({
      stats: allStats,
      onTransactionRunning,
    });
  };

  const confirmDeleteStat = async () => {
    if (!statToDelete) return;

    // Remove the stat from the list - don't include values to avoid unnecessary batchUpdateAssetStats calls
    const remainingStats = trackedStatsWithValues
      .filter((s) => s !== statToDelete)
      .map((s) => convertStatToParams(s, false));

    await setTransferRestrictionStats({
      stats: remainingStats,
      onTransactionRunning: () => {
        setStatToDelete(null);
        setDeleteConfirmOpen(false);
      },
    });
  };

  // Check if stat can be deleted (not used in any active transfer restriction)
  const canDeleteStat = useCallback(
    (stat: TransferRestrictionStatValues): boolean => {
      const restrictions =
        asset?.details?.transferRestrictions?.restrictions || [];

      // Check if this stat is used by any restriction
      return !restrictions.some((restriction) => {
        // Count restrictions use Count stats
        if (restriction.type === 'Count' && stat.type === 'Count') {
          return true;
        }

        // Percentage restrictions use Balance stats
        if (restriction.type === 'Percentage' && stat.type === 'Balance') {
          return true;
        }

        // ClaimCount restrictions use ScopedCount stats
        if (
          restriction.type === 'ClaimCount' &&
          stat.type === 'ScopedCount' &&
          stat.claim
        ) {
          const { issuer, claim } = restriction.value;
          // Must match both issuer and claim type
          return (
            stat.claim.issuer.did === issuer.did &&
            stat.claim.claimType === claim.type
          );
        }

        // ClaimPercentage restrictions use ScopedBalance stats
        if (
          restriction.type === 'ClaimPercentage' &&
          stat.type === 'ScopedBalance' &&
          stat.claim
        ) {
          const { issuer, claim } = restriction.value;
          // Must match both issuer and claim type
          return (
            stat.claim.issuer.did === issuer.did &&
            stat.claim.claimType === claim.type
          );
        }

        return false;
      });
    },
    [asset?.details?.transferRestrictions?.restrictions],
  );

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
      const nonZeroJurisdictions = claimValue.filter(
        (jv) => !jv.value.isZero(),
      );

      return (
        <>
          {claimInfo}
          {nonZeroJurisdictions.length > 0 ? (
            nonZeroJurisdictions.map((jv) => {
              const countryName = jv.countryCode
                ? countryLookup.get(jv.countryCode) || jv.countryCode
                : 'No Jurisdiction';
              return (
                <InlineRow key={jv.countryCode ?? 'no-jurisdiction'}>
                  <InlineLabel title={countryName}>
                    {jv.countryCode
                      ? `Jurisdiction: ${jv.countryCode}`
                      : 'No Jurisdiction'}
                  </InlineLabel>
                  <InlineValue>{jv.value.toString()}</InlineValue>
                </InlineRow>
              );
            })
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

  const isMaxStatsReached =
    maxStatsPerAsset !== null &&
    trackedStatsWithValues.length >= maxStatsPerAsset;

  return (
    <>
      <TabSection>
        <SectionHeader>
          <SectionTitle>Tracked Stats</SectionTitle>
          <AddButton
            onClick={handleAddTrackedStat}
            disabled={transactionInProcess || isMaxStatsReached}
            title={
              isMaxStatsReached
                ? `Maximum of ${maxStatsPerAsset} stats reached`
                : undefined
            }
          >
            <Icon name="Plus" size="16px" />
            Add Tracked Stat
            {isMaxStatsReached && ` (Max ${maxStatsPerAsset} reached)`}
          </AddButton>
        </SectionHeader>

        <GridDataList>
          {trackedStatsWithValues.map((stat) => {
            const statKey = getStatKey(stat);
            const displayName = getStatTypeDisplayName(stat);
            const canDelete = canDeleteStat(stat);

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
                      onClick={() => handleEditStat(stat)}
                      disabled={transactionInProcess}
                      title="Edit stat values"
                    >
                      <Icon name="Edit" size="14px" />
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDeleteStat(stat)}
                      disabled={transactionInProcess || !canDelete}
                      title={
                        !canDelete
                          ? 'This stat is used by an active transfer restriction'
                          : 'Remove this stat'
                      }
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
            No statistics are currently being tracked for this asset. Tracked
            statistics are required before setting transfer restrictions.
          </EmptyState>
        )}
      </TabSection>

      <AddTrackedStatModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        trackedStats={trackedStatsWithValues}
        onAddStat={handleAddStatSubmit}
        transactionInProcess={transactionInProcess}
      />

      <EditTrackedStatModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setStatToEdit(null);
        }}
        statToEdit={statToEdit}
        onEditStat={handleEditStatSubmit}
        transactionInProcess={transactionInProcess}
      />

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setStatToDelete(null);
        }}
        onConfirm={confirmDeleteStat}
        title="Remove Tracked Stat"
        message="Are you sure you want to remove this tracked statistic? Note: Stats that are used in active transfer restrictions cannot be removed."
        confirmLabel="Remove"
        isProcessing={transactionInProcess}
      />
    </>
  );
};
