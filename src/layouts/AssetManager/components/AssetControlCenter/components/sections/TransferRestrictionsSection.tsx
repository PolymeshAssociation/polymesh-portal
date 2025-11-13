import type { TransferRestrictionExemptionParams } from '@polymeshassociation/polymesh-sdk/types';
import { ClaimType, StatType } from '@polymeshassociation/polymesh-sdk/types';
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
import { notifyError } from '~/helpers/notifications';
import { useAssetActionsContext } from '../../context';
import {
  ActionButton,
  AddButton,
  DataItem,
  EmptyExemptionsText,
  EmptyState,
  ExemptionButton,
  ExemptionIdentity,
  ExemptionItemContent,
  ExemptionsContainer,
  ExemptionsSection,
  GridDataList,
  GroupActions,
  GroupContent,
  GroupHeader,
  GroupTitleSection,
  InlineLabel,
  InlineRow,
  InlineValue,
  MediatorItem,
  SectionContent,
  SectionHeader,
  SectionTitle,
  TabSection,
} from '../../styles';
import type { TabProps } from '../../types';
import {
  AddExemptionsModal,
  AddTransferRestrictionModal,
  EditTransferRestrictionModal,
} from '../modals';
import {
  getClaimTypeDescription,
  getRestrictionTypeDescription,
  sdkRestrictionToInputFormat,
  type DisplayRestriction,
} from '../modals/transferRestrictionHelpers';

interface TransferRestrictionsSectionProps {
  asset: TabProps['asset'];
}

interface ClaimDetails {
  countryCode?: string;
  accredited?: boolean;
  affiliate?: boolean;
}

// Helper function to extract claim details from restriction claim
const extractClaimDetails = (claim: unknown): ClaimDetails => {
  const claimDetails: ClaimDetails = {};
  if (claim && typeof claim === 'object') {
    const claimObj = claim as Record<string, unknown>;
    if (claimObj.countryCode && typeof claimObj.countryCode === 'string') {
      claimDetails.countryCode = claimObj.countryCode;
    }
    if (typeof claimObj.accredited === 'boolean') {
      claimDetails.accredited = claimObj.accredited;
    }
    if (typeof claimObj.affiliate === 'boolean') {
      claimDetails.affiliate = claimObj.affiliate;
    }
  }
  return claimDetails;
};

export const TransferRestrictionsSection: React.FC<
  TransferRestrictionsSectionProps
> = ({ asset }) => {
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);
  const {
    setTransferRestrictions,
    addExemptions,
    removeExemptions,
    transactionInProcess,
  } = useAssetActionsContext();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [restrictionToEdit, setRestrictionToEdit] =
    useState<DisplayRestriction | null>(null);
  const [restrictionToDelete, setRestrictionToDelete] =
    useState<DisplayRestriction | null>(null);
  const [restrictionForExemptions, setRestrictionForExemptions] =
    useState<DisplayRestriction | null>(null);
  const [exemptionToRemove, setExemptionToRemove] = useState<{
    restriction: DisplayRestriction;
    did: string;
  } | null>(null);
  const [maxTransferConditionsPerAsset, setMaxTransferConditionsPerAsset] =
    useState<number | null>(null);

  // Fetch max transfer conditions from chain
  useEffect(() => {
    if (!polkadotApi) return;
    try {
      const max = polkadotApi.consts.statistics.maxTransferConditionsPerAsset;
      setMaxTransferConditionsPerAsset(max.toNumber());
    } catch (error) {
      // If we can't fetch the constant, default to 4 (known chain value)
      setMaxTransferConditionsPerAsset(4);
    }
  }, [polkadotApi]);

  // Create lookup map for O(1) country code access
  const countryLookup = useMemo(() => {
    return new Map(
      countryCodes.map((c: { code: string; name: string }) => [c.code, c.name]),
    );
  }, []);

  // Optimized jurisdiction country name lookup
  const getJurisdictionCountryName = (countryCode: string): string => {
    return countryLookup.get(countryCode.toUpperCase()) || countryCode;
  };

  const handleManageTransferRestrictions = useCallback(() => {
    setAddModalOpen(true);
  }, []);

  const handleEditRestriction = useCallback(
    (restriction: DisplayRestriction) => {
      setRestrictionToEdit(restriction);
      setEditModalOpen(true);
    },
    [],
  );

  const handleDeleteRestriction = useCallback(
    (restriction: DisplayRestriction) => {
      setRestrictionToDelete(restriction);
      setDeleteConfirmOpen(true);
    },
    [],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!restrictionToDelete) {
      notifyError('No restriction selected for deletion');
      return;
    }
    if (!asset?.details?.transferRestrictions) {
      notifyError('Asset transfer restrictions data not available');
      return;
    }

    try {
      // Get current SDK restrictions
      const currentRestrictions =
        asset.details.transferRestrictions.restrictions || [];

      // Extract index from the restriction ID (format: "type-index")
      const indexStr = restrictionToDelete.id.split('-').pop();
      const indexToDelete = parseInt(indexStr ?? '', 10);

      if (Number.isNaN(indexToDelete) || indexToDelete < 0) {
        notifyError('Invalid restriction ID');
        return;
      }

      // Filter out the restriction to delete by index
      const filteredRestrictions = currentRestrictions.filter(
        (_, index) => index !== indexToDelete,
      );

      // Convert SDK restrictions to input format
      const updatedRestrictions = filteredRestrictions.map(
        sdkRestrictionToInputFormat,
      );

      // Call setTransferRestrictions with updated array
      await setTransferRestrictions({
        restrictions: updatedRestrictions,
      });

      setDeleteConfirmOpen(false);
      setRestrictionToDelete(null);
    } catch (error) {
      notifyError(
        `Failed to delete transfer restriction: ${(error as Error).message}`,
      );
    }
  }, [restrictionToDelete, asset, setTransferRestrictions]);

  const handleManageExemptions = useCallback(
    (restriction: DisplayRestriction) => {
      setRestrictionForExemptions(restriction);
    },
    [],
  );

  const handleRemoveExemptionClick = useCallback(
    (restriction: DisplayRestriction, did: string) => {
      setExemptionToRemove({ restriction, did });
    },
    [],
  );

  const handleConfirmRemoveExemption = useCallback(async () => {
    if (!exemptionToRemove) return;

    const { restriction, did } = exemptionToRemove;

    try {
      // Build exemption params based on restriction type
      let exemptionParams: TransferRestrictionExemptionParams;

      if (restriction.type === 'Count' || restriction.type === 'Percentage') {
        exemptionParams = {
          type:
            restriction.type === 'Count' ? StatType.Count : StatType.Balance,
          identities: [did],
        };
      } else {
        // Build claim for claim-based restrictions
        if (!restriction.claimType || !restriction.claimIssuer) {
          notifyError('Missing claim information for restriction');
          setExemptionToRemove(null);
          return;
        }

        let claimType: ClaimType;
        if (
          restriction.claimType === ClaimType.Jurisdiction ||
          restriction.claimType === ClaimType.Accredited ||
          restriction.claimType === ClaimType.Affiliate
        ) {
          claimType = restriction.claimType;
        } else {
          notifyError(`Unsupported claim type: ${restriction.claimType}`);
          setExemptionToRemove(null);
          return;
        }

        exemptionParams = {
          type:
            restriction.type === 'ClaimCount'
              ? StatType.ScopedCount
              : StatType.ScopedBalance,
          identities: [did],
          claim: claimType,
        };
      }

      await removeExemptions({
        exemptions: exemptionParams,
        onTransactionRunning: () => setExemptionToRemove(null),
      });
    } catch (error) {
      notifyError(`Failed to remove exemption: ${(error as Error).message}`);
      setExemptionToRemove(null);
    }
  }, [exemptionToRemove, removeExemptions]);

  const handleAddRestriction = useCallback(
    async (params: Parameters<typeof setTransferRestrictions>[0]) => {
      if (!asset?.details?.transferRestrictions) {
        notifyError('Asset transfer restrictions data not available');
        return;
      }

      try {
        // Get current SDK restrictions and convert to input format
        const currentRestrictions =
          asset.details.transferRestrictions.restrictions || [];
        const currentRestrictionsInput = currentRestrictions.map(
          sdkRestrictionToInputFormat,
        );

        // Merge new restriction with existing ones
        const updatedRestrictions = [
          ...currentRestrictionsInput,
          ...params.restrictions,
        ];

        // Call setTransferRestrictions with merged array
        await setTransferRestrictions({
          restrictions: updatedRestrictions,
          onTransactionRunning: params.onTransactionRunning,
        });
      } catch (error) {
        notifyError(
          `Failed to add transfer restriction: ${(error as Error).message}`,
        );
      }
    },
    [asset, setTransferRestrictions],
  );

  const handleAddExemptions = useCallback(
    async (params: {
      exemptions: TransferRestrictionExemptionParams;
      onTransactionRunning?: () => void | Promise<void>;
    }) => {
      await addExemptions(params);
      setRestrictionForExemptions(null);
    },
    [addExemptions],
  );

  const handleEditRestrictionSubmit = useCallback(
    async (params: Parameters<typeof setTransferRestrictions>[0]) => {
      if (!restrictionToEdit) {
        notifyError('No restriction selected for editing');
        return;
      }
      if (!asset?.details?.transferRestrictions) {
        notifyError('Asset transfer restrictions data not available');
        return;
      }

      try {
        // Get current SDK restrictions and convert to input format
        const currentRestrictions =
          asset.details.transferRestrictions.restrictions || [];
        const currentRestrictionsInput = currentRestrictions.map(
          sdkRestrictionToInputFormat,
        );

        // Extract index from the restriction ID (format: "type-index")
        const indexStr = restrictionToEdit.id.split('-').pop();
        const restrictionIndex = parseInt(indexStr ?? '', 10);

        if (Number.isNaN(restrictionIndex) || restrictionIndex < 0) {
          notifyError('Invalid restriction ID');
          return;
        }
        // Replace the restriction in the array
        const updatedRestrictions = [...currentRestrictionsInput];
        const [newRestriction] = params.restrictions;
        updatedRestrictions[restrictionIndex] = newRestriction;

        // Call setTransferRestrictions with updated array
        await setTransferRestrictions({
          restrictions: updatedRestrictions,
          onTransactionRunning: params.onTransactionRunning,
        });
      } catch (error) {
        notifyError(
          `Failed to edit transfer restriction: ${(error as Error).message}`,
        );
      }
    },
    [restrictionToEdit, asset, setTransferRestrictions],
  );

  // Extract and format transfer restrictions from asset data
  // Create a map of exemptions by their exempt key for efficient lookup
  const exemptionsByKey = useMemo(() => {
    const map = new Map<string, string[]>();
    const exemptions = asset?.details?.exemptions || [];

    exemptions.forEach((exemption) => {
      const { opType, claimType } = exemption.exemptKey;

      // Create a key that matches the restriction
      // For Count/Percentage: just use opType
      // For ClaimCount/ClaimPercentage: use opType + claimType
      let key: string;
      if (opType === 'Count' || opType === 'Balance') {
        key = opType;
      } else {
        // For scoped stats, include claim type
        let claimTypeStr = 'none';
        if (claimType) {
          claimTypeStr = typeof claimType === 'string' ? claimType : 'Custom';
        }
        key = `${opType}-${claimTypeStr}`;
      }

      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(exemption.identity.did);
    });

    return map;
  }, [asset?.details?.exemptions]);

  // Memoize restrictions to avoid rebuilding on every render
  const restrictions: DisplayRestriction[] = useMemo(() => {
    const result: DisplayRestriction[] = [];
    const sdkRestrictions =
      asset?.details?.transferRestrictions?.restrictions || [];

    sdkRestrictions.forEach((restriction, index) => {
      let exemptedDids: string[] = [];

      switch (restriction.type) {
        case 'Count':
          exemptedDids = exemptionsByKey.get('Count') || [];
          result.push({
            id: `count-${index}`,
            type: 'Count',
            maxLimit: restriction.value.toString(),
            exemptions: exemptedDids.length,
            exemptedDids,
          });
          break;
        case 'Percentage':
          exemptedDids = exemptionsByKey.get('Balance') || [];
          result.push({
            id: `percentage-${index}`,
            type: 'Percentage',
            maxLimit: restriction.value.toString(), // Store raw value without %
            exemptions: exemptedDids.length,
            exemptedDids,
          });
          break;
        case 'ClaimCount': {
          const { min, max, issuer, claim } = restriction.value;

          // Get claim type for exemption lookup
          const claimType =
            typeof claim.type === 'string' ? claim.type : 'Custom';
          exemptedDids = exemptionsByKey.get(`ScopedCount-${claimType}`) || [];

          result.push({
            id: `claim-count-${index}`,
            type: 'ClaimCount',
            minLimit: min.toString(),
            maxLimit: max ? max.toString() : undefined,
            exemptions: exemptedDids.length,
            exemptedDids,
            claimType: claim.type,
            claimIssuer: issuer.did,
            claimDetails: extractClaimDetails(claim),
          });
          break;
        }
        case 'ClaimPercentage': {
          const { min, max, issuer, claim } = restriction.value;

          // Get claim type for exemption lookup
          const claimType =
            typeof claim.type === 'string' ? claim.type : 'Custom';
          exemptedDids =
            exemptionsByKey.get(`ScopedBalance-${claimType}`) || [];

          result.push({
            id: `claim-percentage-${index}`,
            type: 'ClaimPercentage',
            minLimit: min.toString(), // Store raw value without %
            maxLimit: max.toString(), // Store raw value without %
            exemptions: exemptedDids.length,
            exemptedDids,
            claimType: claim.type,
            claimIssuer: issuer.did,
            claimDetails: extractClaimDetails(claim),
          });
          break;
        }
        default:
          break;
      }
    });

    return result;
  }, [asset?.details?.transferRestrictions?.restrictions, exemptionsByKey]);

  // Keep reference to SDK restrictions for validation
  const sdkRestrictions =
    asset?.details?.transferRestrictions?.restrictions || [];

  // Check if max restrictions limit has been reached
  const isMaxRestrictionsReached =
    maxTransferConditionsPerAsset !== null &&
    sdkRestrictions.length >= maxTransferConditionsPerAsset;

  return (
    <>
      <TabSection>
        <SectionHeader>
          <SectionTitle>Transfer Restrictions</SectionTitle>
          <AddButton
            onClick={handleManageTransferRestrictions}
            disabled={transactionInProcess || isMaxRestrictionsReached}
            title={
              isMaxRestrictionsReached
                ? `Maximum number of transfer restrictions (${maxTransferConditionsPerAsset}) reached`
                : undefined
            }
          >
            <Icon name="Plus" size="16px" />
            Add Restriction
          </AddButton>
        </SectionHeader>
        <SectionContent>
          {restrictions.length > 0 ? (
            <GridDataList>
              {restrictions.map((restriction) => (
                <DataItem key={restriction.id}>
                  {/* Header with restriction type and action buttons */}
                  <GroupHeader>
                    <GroupTitleSection>
                      <InlineRow>
                        <InlineLabel>Type</InlineLabel>
                        <InlineValue>
                          {getRestrictionTypeDescription(restriction.type)}
                        </InlineValue>
                      </InlineRow>
                    </GroupTitleSection>

                    {/* Action buttons in top-right corner */}
                    <GroupActions>
                      <ActionButton
                        onClick={() => handleEditRestriction(restriction)}
                        title="Edit Restriction"
                        disabled={transactionInProcess}
                      >
                        <Icon name="Edit" size="14px" />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDeleteRestriction(restriction)}
                        title="Delete Restriction"
                        disabled={transactionInProcess}
                      >
                        <Icon name="Delete" size="14px" />
                      </ActionButton>
                    </GroupActions>
                  </GroupHeader>

                  {/* Content section */}
                  <GroupContent>
                    {restriction.claimType && (
                      <InlineRow>
                        <InlineLabel>Claim Type</InlineLabel>
                        <InlineValue>
                          {getClaimTypeDescription(
                            restriction.claimType,
                            restriction.claimDetails || {},
                          )}
                        </InlineValue>
                      </InlineRow>
                    )}

                    {restriction.claimType === 'Jurisdiction' && (
                      <InlineRow>
                        <InlineLabel>Jurisdiction</InlineLabel>
                        <InlineValue>
                          {restriction.claimDetails?.countryCode
                            ? getJurisdictionCountryName(
                                restriction.claimDetails.countryCode,
                              )
                            : 'No Jurisdiction'}
                        </InlineValue>
                      </InlineRow>
                    )}

                    {restriction.claimIssuer && (
                      <InlineRow>
                        <InlineLabel>Claim Issuer</InlineLabel>
                        <InlineValue>
                          {formatDid(restriction.claimIssuer, 8, 8)}
                          <CopyToClipboard value={restriction.claimIssuer} />
                        </InlineValue>
                      </InlineRow>
                    )}

                    {restriction.maxLimit && (
                      <InlineRow>
                        <InlineLabel>Max Limit</InlineLabel>
                        <InlineValue>
                          {restriction.type === 'Percentage' ||
                          restriction.type === 'ClaimPercentage'
                            ? `${restriction.maxLimit}%`
                            : restriction.maxLimit}
                        </InlineValue>
                      </InlineRow>
                    )}

                    {restriction.minLimit && (
                      <InlineRow>
                        <InlineLabel>Min Limit</InlineLabel>
                        <InlineValue>
                          {restriction.type === 'ClaimPercentage'
                            ? `${restriction.minLimit}%`
                            : restriction.minLimit}
                        </InlineValue>
                      </InlineRow>
                    )}

                    {/* Exemptions section with inline management */}
                    <ExemptionsSection>
                      <InlineLabel>
                        EXEMPTIONS ({restriction.exemptions})
                      </InlineLabel>
                      <ExemptionButton
                        onClick={() => handleManageExemptions(restriction)}
                        disabled={transactionInProcess}
                        title="Add exemptions"
                      >
                        <Icon name="Plus" size="20px" />
                      </ExemptionButton>
                    </ExemptionsSection>

                    {restriction.exemptedDids.length === 0 ? (
                      <EmptyExemptionsText>
                        No exempted identities
                      </EmptyExemptionsText>
                    ) : (
                      <ExemptionsContainer>
                        {restriction.exemptedDids.map((did, index) => (
                          <MediatorItem
                            key={did}
                            $isLast={
                              index === restriction.exemptedDids.length - 1
                            }
                          >
                            <ExemptionItemContent>
                              <ExemptionIdentity>
                                {formatDid(did, 8, 8)}
                                <CopyToClipboard value={did} />
                              </ExemptionIdentity>
                              <ExemptionButton
                                onClick={() =>
                                  handleRemoveExemptionClick(restriction, did)
                                }
                                disabled={transactionInProcess}
                                title="Remove this exemption"
                              >
                                <Icon name="Delete" size="16px" />
                              </ExemptionButton>
                            </ExemptionItemContent>
                          </MediatorItem>
                        ))}
                      </ExemptionsContainer>
                    )}
                  </GroupContent>
                </DataItem>
              ))}
            </GridDataList>
          ) : (
            <EmptyState>
              No transfer restrictions configured. Transfer restrictions limit
              how many tokens can be held by individuals or groups.
            </EmptyState>
          )}
        </SectionContent>
      </TabSection>

      <AddTransferRestrictionModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        trackedStats={asset?.details?.trackedStatistics || []}
        existingRestrictions={sdkRestrictions}
        onAddRestriction={handleAddRestriction}
        transactionInProcess={transactionInProcess}
      />

      <EditTransferRestrictionModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setRestrictionToEdit(null);
        }}
        restrictionToEdit={restrictionToEdit}
        onEditRestriction={handleEditRestrictionSubmit}
        transactionInProcess={transactionInProcess}
      />

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setRestrictionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Transfer Restriction"
        message="Are you sure you want to delete this transfer restriction? This action cannot be undone and will affect how transfers are validated for this asset."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isProcessing={transactionInProcess}
      />

      <AddExemptionsModal
        onClose={() => {
          setRestrictionForExemptions(null);
        }}
        restriction={restrictionForExemptions}
        onAddExemptions={handleAddExemptions}
      />

      <ConfirmationModal
        isOpen={!!exemptionToRemove}
        onClose={() => setExemptionToRemove(null)}
        onConfirm={handleConfirmRemoveExemption}
        title="Remove Exemption"
        message={`Are you sure you want to remove this exemption? The identity ${exemptionToRemove?.did ? formatDid(exemptionToRemove.did, 8, 8) : ''} will be subject to this transfer restriction.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        isProcessing={transactionInProcess}
      />
    </>
  );
};
