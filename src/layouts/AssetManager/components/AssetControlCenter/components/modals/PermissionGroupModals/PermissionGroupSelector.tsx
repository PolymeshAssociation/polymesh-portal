import {
  AGENT_TX_GROUP_VALUES,
  AgentTxGroup,
  TxGroup,
} from '@polymeshassociation/polymesh-sdk/types';
import { txGroupToTxTags } from '@polymeshassociation/polymesh-sdk/utils';
import React, { useCallback, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Icon } from '~/components';
import {
  FieldLabel,
  FieldRow,
  FieldWrapper,
  StyledErrorMessage,
} from '../../../../CreateAssetWizard/styles';
import {
  ExpandButton,
  GroupCheckbox,
  GroupHeader,
  GroupHeaderLeft,
  GroupItem,
  GroupLabel,
  TransactionCheckbox,
  TransactionGroupsContainer,
  TransactionItem,
  TransactionLabel,
  TransactionList,
} from '../../../styles';
import { AGENT_TX_GROUP_LABELS } from './shared';

interface PermissionGroupSelectorProps {
  selectedGroups: AgentTxGroup[];
  selectedTransactions: Record<AgentTxGroup, string[]>;
  transactionInProcess: boolean;
  errors?: {
    selectedGroups?: {
      message?: string;
    };
  };
  setValue: UseFormSetValue<{
    selectedGroups: AgentTxGroup[];
    selectedTransactions: Record<AgentTxGroup, string[]>;
  }>;
}

export const PermissionGroupSelector: React.FC<
  PermissionGroupSelectorProps
> = ({ selectedTransactions, transactionInProcess, errors, setValue }) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<AgentTxGroup>>(
    new Set(),
  );

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
      const currentTransactions = selectedTransactions || {};
      const groupTransactions = currentTransactions[group] || [];
      const allTransactionsForGroup = (txGroupToTxTags(group as TxGroup) ||
        []) as string[];

      if (groupTransactions.length === allTransactionsForGroup.length) {
        // All transactions are selected, unselect all
        setValue('selectedTransactions', {
          ...currentTransactions,
          [group]: [],
        });
      } else {
        // Some or no transactions selected, select all
        setValue('selectedTransactions', {
          ...currentTransactions,
          [group]: allTransactionsForGroup,
        });
      }
    },
    [selectedTransactions, setValue],
  );

  const toggleTransaction = useCallback(
    (group: AgentTxGroup, transaction: string) => {
      const currentTransactions = selectedTransactions || {};
      const groupTransactions = currentTransactions[group] || [];
      const isSelected = groupTransactions.includes(transaction);

      if (isSelected) {
        setValue('selectedTransactions', {
          ...currentTransactions,
          [group]: groupTransactions.filter((t) => t !== transaction),
        });
      } else {
        setValue('selectedTransactions', {
          ...currentTransactions,
          [group]: [...groupTransactions, transaction],
        });
      }
    },
    [selectedTransactions, setValue],
  );

  // Helper function to determine checkbox state for parent groups
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
    <FieldWrapper>
      <FieldRow>
        <FieldLabel>Transaction Groups</FieldLabel>
      </FieldRow>

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
                        // eslint-disable-next-line no-param-reassign
                        input.indeterminate = indeterminate;
                      }
                    }}
                    onChange={() => toggleGroup(group)}
                    disabled={transactionInProcess}
                  />
                  <GroupLabel>{AGENT_TX_GROUP_LABELS[group]}</GroupLabel>
                </GroupHeaderLeft>

                <ExpandButton
                  type="button"
                  onClick={() => toggleGroupExpansion(group)}
                  disabled={transactionInProcess}
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
                          disabled={transactionInProcess}
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

      {errors?.selectedGroups && (
        <StyledErrorMessage>{errors.selectedGroups.message}</StyledErrorMessage>
      )}
    </FieldWrapper>
  );
};
