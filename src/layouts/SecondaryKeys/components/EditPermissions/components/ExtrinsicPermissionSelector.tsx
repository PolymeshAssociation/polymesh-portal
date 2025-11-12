import { TxGroup, TxTag } from '@polymeshassociation/polymesh-sdk/types';
import { txGroupToTxTags } from '@polymeshassociation/polymesh-sdk/utils';
import { useCallback, useState } from 'react';
import { Icon } from '~/components';
import {
  ExpandButton,
  GroupCheckboxLabel,
  GroupHeader,
  GroupHeaderLeft,
  GroupItem,
  GroupLabelArea,
  PermissionCheckbox,
  SelectWrapper,
  TransactionCheckbox,
  TransactionCheckboxLabel,
  TransactionGroupsContainer,
  TransactionItem,
  TransactionLabel,
  TransactionList,
} from '../styles';

interface IExtrinsicPermissionSelectorProps {
  selectedExtrinsics: Array<{ pallet: string; extrinsics?: string[] | null }>;
  onChange: (
    extrinsics: Array<{ pallet: string; extrinsics?: string[] | null }>,
  ) => void;
}

// Get all available transaction groups
const ALL_TX_GROUPS = Object.values(TxGroup);

// Human-readable labels for all transaction groups
const TX_GROUP_LABELS: Record<TxGroup, string> = {
  AdvancedAssetManagement: 'Advanced Asset Management',
  AssetDocumentManagement: 'Asset Document Management',
  AssetManagement: 'Asset Management',
  AssetMetadataManagement: 'Asset Metadata Management',
  AssetRegistration: 'Asset Registration',
  AuthorizationManagement: 'Authorization Management',
  CapitalDistribution: 'Capital Distribution',
  CddRegistration: 'CDD Registration',
  CheckpointManagement: 'Checkpoint Management',
  ClaimsManagement: 'Claims Management',
  ComplianceManagement: 'Compliance Management',
  CorporateActionsManagement: 'Corporate Actions Management',
  CorporateBallotManagement: 'Corporate Ballot Management',
  CorporateVoting: 'Corporate Voting',
  ExternalAgentManagement: 'External Agent Management',
  ExternalAgentParticipation: 'External Agent Participation',
  Issuance: 'Issuance',
  MultiSigManagement: 'MultiSig Management',
  PortfolioManagement: 'Portfolio Management',
  Redemption: 'Redemption',
  RelayerManagement: 'Relayer Management',
  SettlementManagement: 'Settlement Management',
  StoManagement: 'STO Management',
  TrustedClaimIssuersManagement: 'Trusted Claim Issuers Management',
};

export const ExtrinsicPermissionSelector = ({
  selectedExtrinsics,
  onChange,
}: IExtrinsicPermissionSelectorProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<TxGroup>>(new Set());
  const formatTransactionLabel = useCallback((tx: string) => {
    const [pallet, extrinsic] = tx.split('.');
    const formattedPallet = pallet
      ? `${pallet.charAt(0).toUpperCase()}${pallet.slice(1)}`
      : pallet;
    return extrinsic ? `${formattedPallet} - ${extrinsic}` : formattedPallet;
  }, []);
  // Track selected transactions per group independently
  const [selectedByGroup, setSelectedByGroup] = useState<
    Record<TxGroup, Set<string>>
  >(() => {
    const initial: Record<TxGroup, Set<string>> = {} as Record<
      TxGroup,
      Set<string>
    >;
    ALL_TX_GROUPS.forEach((group) => {
      initial[group] = new Set();
    });

    // Initialize from selectedExtrinsics
    selectedExtrinsics.forEach(({ pallet, extrinsics }) => {
      ALL_TX_GROUPS.forEach((group) => {
        const allTransactions = txGroupToTxTags(group as TxGroup) || [];

        // Handle null extrinsics (meaning all transactions for this pallet)
        if (extrinsics === null) {
          allTransactions.forEach((tx) => {
            if (tx.startsWith(`${pallet}.`)) {
              initial[group].add(tx);
            }
          });
        } else if (extrinsics && extrinsics.length > 0) {
          extrinsics.forEach((ext) => {
            const txTag = `${pallet}.${ext}` as TxTag;
            if (allTransactions.includes(txTag)) {
              initial[group].add(txTag);
            }
          });
        }
      });
    });

    return initial;
  });

  const emitSelection = useCallback(
    (updated: Record<TxGroup, Set<string>>) => {
      // Get all selected transactions across all groups
      const allSelectedTxTagsSet = new Set<string>();

      ALL_TX_GROUPS.forEach((group) => {
        updated[group].forEach((tx) => {
          allSelectedTxTagsSet.add(tx);
        });
      });

      // Group transactions by pallet
      const palletMap = new Map<string, Set<string>>();

      allSelectedTxTagsSet.forEach((txTag) => {
        const [pallet, extrinsic] = txTag.split('.');
        if (!palletMap.has(pallet)) {
          palletMap.set(pallet, new Set());
        }
        if (extrinsic) {
          palletMap.get(pallet)!.add(extrinsic);
        }
      });

      // Build result, detecting full pallets and using null
      const result: Array<{ pallet: string; extrinsics?: string[] | null }> =
        [];
      palletMap.forEach((extrinsics, pallet) => {
        // Get all possible transactions for this pallet
        const allTransactionsForPallet: string[] = [];
        ALL_TX_GROUPS.forEach((group) => {
          const txTags = txGroupToTxTags(group as TxGroup) || [];
          txTags.forEach((tx) => {
            if (
              tx.startsWith(`${pallet}.`) &&
              !allTransactionsForPallet.includes(tx)
            ) {
              allTransactionsForPallet.push(tx);
            }
          });
        });

        // If all transactions for this pallet are selected, use null to denote "all"
        if (extrinsics.size === allTransactionsForPallet.length) {
          result.push({ pallet, extrinsics: null });
        } else {
          result.push({ pallet, extrinsics: Array.from(extrinsics) });
        }
      });

      onChange(result);
    },
    [onChange],
  );

  const toggleGroupExpansion = useCallback((group: TxGroup) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  }, []);

  const toggleGroup = useCallback(
    (group: TxGroup) => {
      setSelectedByGroup((prev) => {
        const updated = { ...prev };
        updated[group] = new Set(prev[group]);

        const allTransactionsForGroup = (txGroupToTxTags(group as TxGroup) ||
          []) as string[];

        // If all are selected, unselect all
        if (updated[group].size === allTransactionsForGroup.length) {
          updated[group].clear();
        } else {
          // Select all
          allTransactionsForGroup.forEach((tx) => {
            updated[group].add(tx);
          });
        }

        emitSelection(updated);
        return updated;
      });
    },
    [emitSelection],
  );

  const toggleTransaction = useCallback(
    (group: TxGroup, transaction: string) => {
      setSelectedByGroup((prev) => {
        const updated = { ...prev };
        updated[group] = new Set(prev[group]);

        if (updated[group].has(transaction)) {
          updated[group].delete(transaction);
        } else {
          updated[group].add(transaction);
        }

        emitSelection(updated);
        return updated;
      });
    },
    [emitSelection],
  );

  const getGroupCheckboxState = useCallback(
    (group: TxGroup) => {
      const allTransactions = txGroupToTxTags(group as TxGroup) || [];
      const selectedCount = selectedByGroup[group]?.size || 0;

      if (selectedCount === 0) {
        return { checked: false, indeterminate: false };
      }
      if (selectedCount === allTransactions.length) {
        return { checked: true, indeterminate: false };
      }
      return { checked: false, indeterminate: true };
    },
    [selectedByGroup],
  );

  return (
    <SelectWrapper>
      <TransactionGroupsContainer>
        {ALL_TX_GROUPS.map((group) => {
          const { checked, indeterminate } = getGroupCheckboxState(group);
          const isExpanded = expandedGroups.has(group);
          const allTransactions = txGroupToTxTags(group as TxGroup) || [];

          return (
            <GroupItem key={group}>
              <GroupHeader onClick={() => toggleGroupExpansion(group)}>
                <GroupHeaderLeft>
                  <PermissionCheckbox
                    id={`group-${group}`}
                    checked={checked}
                    ref={(checkboxInput: HTMLInputElement | null) => {
                      if (checkboxInput) {
                        // HTML checkbox `indeterminate` is not exposed as a React prop,
                        // so we must set it directly on the DOM node in the ref callback.
                        // eslint-disable-next-line no-param-reassign
                        checkboxInput.indeterminate = indeterminate;
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleGroup(group);
                    }}
                  />
                  <GroupLabelArea>
                    <GroupCheckboxLabel>
                      {TX_GROUP_LABELS[group]}
                    </GroupCheckboxLabel>
                  </GroupLabelArea>
                </GroupHeaderLeft>

                <ExpandButton
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGroupExpansion(group);
                  }}
                  $isExpanded={isExpanded}
                >
                  <Icon name="ExpandIcon" size="16px" />
                </ExpandButton>
              </GroupHeader>

              {isExpanded && (
                <TransactionList>
                  {allTransactions.map((transaction) => {
                    const isTransactionSelected = (
                      selectedByGroup[group] || new Set()
                    ).has(transaction);

                    return (
                      <TransactionItem key={`${group}-${transaction}`}>
                        <TransactionCheckboxLabel
                          htmlFor={`tx-${group}-${transaction}`}
                        >
                          <TransactionCheckbox
                            id={`tx-${group}-${transaction}`}
                            checked={isTransactionSelected || false}
                            onChange={() =>
                              toggleTransaction(group, transaction)
                            }
                          />
                          <TransactionLabel>
                            {formatTransactionLabel(transaction)}
                          </TransactionLabel>
                        </TransactionCheckboxLabel>
                      </TransactionItem>
                    );
                  })}
                </TransactionList>
              )}
            </GroupItem>
          );
        })}
      </TransactionGroupsContainer>
    </SelectWrapper>
  );
};
