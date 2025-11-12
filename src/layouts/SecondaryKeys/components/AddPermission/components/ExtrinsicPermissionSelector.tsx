import { useState, useCallback } from 'react';
import { Icon } from '~/components';
import styled from 'styled-components';
import {
  AGENT_TX_GROUP_VALUES,
  AgentTxGroup,
  TxGroup,
} from '@polymeshassociation/polymesh-sdk/types';
import { txGroupToTxTags } from '@polymeshassociation/polymesh-sdk/utils';

interface IExtrinsicPermissionSelectorProps {
  selectedExtrinsics: Array<{ pallet: string; extrinsics?: string[] }>;
  onChange: (extrinsics: Array<{ pallet: string; extrinsics?: string[] }>) => void;
}

// Human-readable labels for agent transaction groups
const AGENT_TX_GROUP_LABELS: Record<AgentTxGroup, string> = {
  AdvancedAssetManagement: 'Advanced Asset Management',
  AssetDocumentManagement: 'Asset Document Management',
  AssetManagement: 'Asset Management',
  AssetMetadataManagement: 'Asset Metadata Management',
  CapitalDistribution: 'Capital Distribution',
  CheckpointManagement: 'Checkpoint Management',
  ComplianceManagement: 'Compliance Management',
  CorporateActionsManagement: 'Corporate Actions Management',
  CorporateBallotManagement: 'Corporate Ballot Management',
  ExternalAgentManagement: 'External Agent Management',
  Issuance: 'Issuance',
  Redemption: 'Redemption',
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
  const [expandedGroups, setExpandedGroups] = useState<Set<AgentTxGroup>>(new Set());

  // Convert selectedExtrinsics to a format compatible with the selector
  const selectedTransactions: Record<AgentTxGroup, string[]> = {};
  selectedExtrinsics.forEach(({ pallet, extrinsics }) => {
    // Find which group this pallet belongs to
    AGENT_TX_GROUP_VALUES.forEach((group) => {
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

  const toggleGroupExpansion = useCallback((group: AgentTxGroup) => {
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
    (group: AgentTxGroup) => {
      const currentGroupTransactions = selectedTransactions[group] || [];
      const allTransactionsForGroup = (txGroupToTxTags(group as TxGroup) || []) as string[];

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
    (group: AgentTxGroup, transaction: string) => {
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

  const convertAndEmit = (transactions: Record<AgentTxGroup, string[]>) => {
    // Convert back to the format expected by the parent
    const palletMap = new Map<string, Set<string>>();

    Object.values(transactions).flat().forEach((txTag) => {
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
    (group: AgentTxGroup) => {
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
        {AGENT_TX_GROUP_VALUES.map((group) => {
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
                  <GroupLabel>{AGENT_TX_GROUP_LABELS[group]}</GroupLabel>
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
