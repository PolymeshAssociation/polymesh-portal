import { useState, useCallback } from 'react';
import styled from 'styled-components';
import {
  TxGroup,
} from '@polymeshassociation/polymesh-sdk/types';
import { txGroupToTxTags } from '@polymeshassociation/polymesh-sdk/utils';
import { Icon } from '~/components';

interface IExtrinsicPermissionSelectorProps {
  selectedExtrinsics: Array<{ pallet: string; extrinsics?: string[] }>;
  onChange: (
    extrinsics: Array<{ pallet: string; extrinsics?: string[] }>,
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

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const TransactionGroupsContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 8px;
  max-height: 400px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.landingBackground};
`;

const GroupItem = styled.div`
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const GroupHeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const GroupCheckbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 12px;
  accent-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? theme.colors.buttonBackground
      : theme.colors.textPink};
  width: 16px;
  height: 16px;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const GroupLabel = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ExpandButton = styled.button<{ $isExpanded: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transform: ${({ $isExpanded }) =>
    $isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.hoverBackground};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const TransactionList = styled.div`
  margin-top: 4px;
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 2px 24px;
`;

const TransactionCheckbox = styled(GroupCheckbox)`
  margin-right: 8px;
  transform: scale(0.9);
`;

const TransactionLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  word-break: break-word;
`;

export const ExtrinsicPermissionSelector = ({
  selectedExtrinsics,
  onChange,
}: IExtrinsicPermissionSelectorProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<TxGroup>>(
    new Set(),
  );

  // Convert selectedExtrinsics to a format compatible with the selector
  const selectedTransactions: Record<TxGroup, string[]> = {};
  selectedExtrinsics.forEach(({ pallet, extrinsics }) => {
    // Find which group this pallet belongs to
    ALL_TX_GROUPS.forEach((group) => {
      const allTransactions = txGroupToTxTags(group as TxGroup) || [];
      if (extrinsics && extrinsics.length > 0) {
        // Specific extrinsics
        extrinsics.forEach((ext) => {
          const txTag = `${pallet}.${ext}`;
          if (allTransactions.includes(txTag)) {
            if (!selectedTransactions[group]) {
              selectedTransactions[group] = [];
            }
            selectedTransactions[group].push(txTag);
          }
        });
      } else {
        // Whole pallet - add all transactions from this pallet
        allTransactions.forEach((tx) => {
          if (tx.startsWith(`${pallet}.`)) {
            if (!selectedTransactions[group]) {
              selectedTransactions[group] = [];
            }
            selectedTransactions[group].push(tx);
          }
        });
      }
    });
  });

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
      const currentGroupTransactions = selectedTransactions[group] || [];
      const allTransactionsForGroup = (txGroupToTxTags(group as TxGroup) ||
        []) as string[];

      if (currentGroupTransactions.length === allTransactionsForGroup.length) {
        // All transactions are selected, unselect all from this group
        const updatedTransactions = { ...selectedTransactions };
        delete updatedTransactions[group];
        convertAndEmit(updatedTransactions);
      } else {
        // Some or no transactions selected, select all
        const updatedTransactions = {
          ...selectedTransactions,
          [group]: allTransactionsForGroup,
        };
        convertAndEmit(updatedTransactions);
      }
    },
    [selectedTransactions, onChange],
  );

  const toggleTransaction = useCallback(
    (group: TxGroup, transaction: string) => {
      const currentGroupTransactions = selectedTransactions[group] || [];
      const isSelected = currentGroupTransactions.includes(transaction);

      if (isSelected) {
        const updatedTransactions = {
          ...selectedTransactions,
          [group]: currentGroupTransactions.filter((t) => t !== transaction),
        };
        if (updatedTransactions[group].length === 0) {
          delete updatedTransactions[group];
        }
        convertAndEmit(updatedTransactions);
      } else {
        const updatedTransactions = {
          ...selectedTransactions,
          [group]: [...currentGroupTransactions, transaction],
        };
        convertAndEmit(updatedTransactions);
      }
    },
    [selectedTransactions, onChange],
  );

  const convertAndEmit = (transactions: Record<TxGroup, string[]>) => {
    // Convert back to the format expected by the parent
    const palletMap = new Map<string, Set<string>>();

    Object.values(transactions)
      .flat()
      .forEach((txTag) => {
        const [pallet, extrinsic] = txTag.split('.');
        if (!palletMap.has(pallet)) {
          palletMap.set(pallet, new Set());
        }
        if (extrinsic) {
          palletMap.get(pallet)!.add(extrinsic);
        }
      });

    const result: Array<{ pallet: string; extrinsics?: string[] }> = [];
    palletMap.forEach((extrinsics, pallet) => {
      result.push({ pallet, extrinsics: Array.from(extrinsics) });
    });

    onChange(result);
  };

  const getGroupCheckboxState = useCallback(
    (group: TxGroup) => {
      const allTransactions = txGroupToTxTags(group as TxGroup) || [];
      const selectedTransactionsForGroup = selectedTransactions[group] || [];

      if (selectedTransactionsForGroup.length === 0) {
        return { checked: false, indeterminate: false };
      }
      if (selectedTransactionsForGroup.length === allTransactions.length) {
        return { checked: true, indeterminate: false };
      }
      return { checked: false, indeterminate: true };
    },
    [selectedTransactions],
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
              <GroupHeader>
                <GroupHeaderLeft>
                  <GroupCheckbox
                    checked={checked}
                    ref={(input: HTMLInputElement | null) => {
                      if (input) {
                        input.indeterminate = indeterminate;
                      }
                    }}
                    onChange={() => toggleGroup(group)}
                  />
                  <GroupLabel>{TX_GROUP_LABELS[group]}</GroupLabel>
                </GroupHeaderLeft>

                <ExpandButton
                  type="button"
                  onClick={() => toggleGroupExpansion(group)}
                  $isExpanded={isExpanded}
                >
                  <Icon name="ExpandIcon" size="16px" />
                </ExpandButton>
              </GroupHeader>

              {isExpanded && (
                <TransactionList>
                  {allTransactions.map((transaction) => {
                    const isTransactionSelected = (
                      selectedTransactions[group] || []
                    ).includes(transaction);

                    return (
                      <TransactionItem key={transaction}>
                        <TransactionCheckbox
                          checked={isTransactionSelected || false}
                          onChange={() => toggleTransaction(group, transaction)}
                        />
                        <TransactionLabel>{transaction}</TransactionLabel>
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
