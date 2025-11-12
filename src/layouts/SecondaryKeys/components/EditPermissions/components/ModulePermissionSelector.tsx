import { TxGroup } from '@polymeshassociation/polymesh-sdk/types';
import { txGroupToTxTags } from '@polymeshassociation/polymesh-sdk/utils';
import { useCallback, useMemo, useState } from 'react';
import { Icon } from '~/components';
import {
  ExpandButton,
  GroupCheckboxLabel,
  GroupHeader,
  GroupHeaderLeft,
  GroupItem,
  GroupLabelArea,
  GroupStatus,
  PermissionCheckbox,
  TransactionCheckbox,
  TransactionCheckboxLabel,
  TransactionGroupsContainer,
  TransactionItem,
  TransactionLabel,
  TransactionList,
} from '../styles';

interface IModulePermissionSelectorProps {
  selectedExtrinsics: Array<{ pallet: string; extrinsics?: string[] | null }>;
  onChange: (
    extrinsics: Array<{ pallet: string; extrinsics?: string[] | null }>,
  ) => void;
}

export const ModulePermissionSelector = ({
  selectedExtrinsics,
  onChange,
}: IModulePermissionSelectorProps) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );

  // Format transaction label with pallet - transaction format
  const formatTransactionLabel = useCallback(
    (pallet: string, extrinsic?: string) => {
      const formattedPallet = pallet
        ? `${pallet.charAt(0).toUpperCase()}${pallet.slice(1)}`
        : pallet;
      return extrinsic ? `${formattedPallet} - ${extrinsic}` : formattedPallet;
    },
    [],
  );

  // Build a map of all pallets to their transaction groups
  const palletGroups = useMemo(() => {
    const map = new Map<
      string,
      { group: TxGroup; palletName: string; allTxs: string[] }
    >();

    Object.values(TxGroup).forEach((group) => {
      const txTags = txGroupToTxTags(group as TxGroup) || [];
      txTags.forEach((tx) => {
        const [pallet] = tx.split('.');
        if (pallet && !map.has(pallet)) {
          map.set(pallet, { group, palletName: pallet, allTxs: [] });
        }
      });
    });

    // Populate all transactions for each pallet
    Object.values(TxGroup).forEach((group) => {
      const txTags = txGroupToTxTags(group as TxGroup) || [];
      txTags.forEach((tx) => {
        const [pallet] = tx.split('.');
        if (pallet && map.has(pallet)) {
          const entry = map.get(pallet)!;
          if (!entry.allTxs.includes(tx)) {
            entry.allTxs.push(tx);
          }
        }
      });
    });

    return map;
  }, []);

  // Create a sorted list of all pallets for display
  const sortedPallets = useMemo(() => {
    const pallets: Array<{ pallet: string; allTxs: string[] }> = [];

    palletGroups.forEach((info, pallet) => {
      pallets.push({ pallet, allTxs: info.allTxs });
    });

    // Sort alphabetically by pallet name
    return pallets.sort((a, b) => a.pallet.localeCompare(b.pallet));
  }, [palletGroups]);

  // Check if a pallet is fully selected (all transactions or null)
  const isPalletFullSelected = useCallback(
    (pallet: string): boolean => {
      const selected = selectedExtrinsics.find((s) => s.pallet === pallet);
      if (!selected) return false;

      // null means all transactions for this pallet
      if (selected.extrinsics === null) return true;

      // Check if all transactions for this pallet are selected
      const palletInfo = palletGroups.get(pallet);
      if (!palletInfo || !selected.extrinsics) return false;

      // Extract extrinsic names from full transaction tags for comparison
      const allExtrinsicNames = palletInfo.allTxs.map((tx) => tx.split('.')[1]);

      return (
        selected.extrinsics.length === allExtrinsicNames.length &&
        allExtrinsicNames.every((name) => selected.extrinsics!.includes(name))
      );
    },
    [selectedExtrinsics, palletGroups],
  );

  // Check if a pallet has partial selection (some but not all transactions)
  const isPalletPartiallySelected = useCallback(
    (pallet: string): boolean => {
      const selected = selectedExtrinsics.find((s) => s.pallet === pallet);
      if (!selected) return false;

      // null means all transactions, so not partial
      if (selected.extrinsics === null) return false;

      // No extrinsics means none selected
      if (!selected.extrinsics || selected.extrinsics.length === 0)
        return false;

      // Check if it's not fully selected but has some selections
      return !isPalletFullSelected(pallet);
    },
    [selectedExtrinsics, isPalletFullSelected],
  );

  // Get status text for a pallet
  const getPalletStatus = useCallback(
    (pallet: string): string => {
      const selected = selectedExtrinsics.find((s) => s.pallet === pallet);
      if (!selected) return '';

      if (selected.extrinsics === null) return 'All methods';
      if (!selected.extrinsics || selected.extrinsics.length === 0)
        return 'None';

      const palletInfo = palletGroups.get(pallet);
      const totalTxs = palletInfo?.allTxs.length || 0;
      return `${selected.extrinsics.length} of ${totalTxs} methods`;
    },
    [selectedExtrinsics, palletGroups],
  );

  const toggleModule = useCallback(
    (pallet: string) => {
      const palletInfo = palletGroups.get(pallet);
      if (!palletInfo) return;

      const isCurrentlyFull = isPalletFullSelected(pallet);

      const updated = selectedExtrinsics.filter((s) => s.pallet !== pallet);

      if (!isCurrentlyFull) {
        // Select all for this pallet (use null to denote all)
        updated.push({ pallet, extrinsics: null });
      }

      onChange(updated);
    },
    [selectedExtrinsics, palletGroups, isPalletFullSelected, onChange],
  );

  const toggleModuleExpansion = useCallback((pallet: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pallet)) {
        newSet.delete(pallet);
      } else {
        newSet.add(pallet);
      }
      return newSet;
    });
  }, []);

  const toggleTransaction = useCallback(
    (pallet: string, transaction: string) => {
      const selected = selectedExtrinsics.find((s) => s.pallet === pallet);
      const palletInfo = palletGroups.get(pallet);
      if (!palletInfo) return;

      const updated = selectedExtrinsics.filter((s) => s.pallet !== pallet);
      const currentExtrinsics = selected?.extrinsics || [];

      // Extract just the extrinsic name from the full transaction tag
      const [, extrinsicName] = transaction.split('.');
      if (!extrinsicName) return;

      // If current state is null (all), convert to specific list of extrinsic names
      let mutableExtrinsics: string[];
      if (selected?.extrinsics === null || currentExtrinsics === null) {
        // Convert full transaction tags to just extrinsic names
        mutableExtrinsics = palletInfo.allTxs.map((tx) => tx.split('.')[1]);
      } else {
        mutableExtrinsics = Array.isArray(currentExtrinsics)
          ? [...currentExtrinsics]
          : [];
      }

      // Toggle the extrinsic name (not full transaction tag)
      if (mutableExtrinsics.includes(extrinsicName)) {
        mutableExtrinsics = mutableExtrinsics.filter(
          (t) => t !== extrinsicName,
        );
      } else {
        mutableExtrinsics.push(extrinsicName);
      }

      // Add back to updated if not empty
      if (mutableExtrinsics.length > 0) {
        updated.push({ pallet, extrinsics: mutableExtrinsics });
      }

      onChange(updated);
    },
    [selectedExtrinsics, palletGroups, onChange],
  );

  return (
    <TransactionGroupsContainer>
      {sortedPallets.map(({ pallet, allTxs }) => {
        const isExpanded = expandedModules.has(pallet);
        const selected = selectedExtrinsics.find((s) => s.pallet === pallet);
        // Don't default to [] - preserve null vs undefined vs array distinction
        const selectedTxs = selected?.extrinsics;

        return (
          <GroupItem key={pallet}>
            <GroupHeader onClick={() => toggleModuleExpansion(pallet)}>
              <GroupHeaderLeft>
                <PermissionCheckbox
                  checked={isPalletFullSelected(pallet)}
                  ref={(checkboxInput: HTMLInputElement | null) => {
                    if (checkboxInput) {
                      // eslint-disable-next-line no-param-reassign
                      checkboxInput.indeterminate =
                        isPalletPartiallySelected(pallet);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleModule(pallet);
                  }}
                />
                <GroupLabelArea>
                  <GroupCheckboxLabel>
                    {pallet.charAt(0).toUpperCase()}
                    {pallet.slice(1)}
                  </GroupCheckboxLabel>
                  {getPalletStatus(pallet) && (
                    <GroupStatus>({getPalletStatus(pallet)})</GroupStatus>
                  )}
                </GroupLabelArea>
              </GroupHeaderLeft>

              <ExpandButton
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModuleExpansion(pallet);
                }}
                $isExpanded={isExpanded}
              >
                <Icon name="ExpandIcon" size="16px" />
              </ExpandButton>
            </GroupHeader>

            {isExpanded && (
              <TransactionList>
                {allTxs.map((transaction) => {
                  // Transaction is full tag like 'asset.freeze'
                  // But selectedTxs contains just extrinsic names like 'freeze'
                  // Extract extrinsic name from transaction for comparison
                  const [, extrinsicName] = transaction.split('.');
                  const isTransactionSelected =
                    selectedTxs === null ||
                    (Array.isArray(selectedTxs) &&
                      extrinsicName &&
                      selectedTxs.includes(extrinsicName));

                  return (
                    <TransactionItem key={transaction}>
                      <TransactionCheckboxLabel>
                        <TransactionCheckbox
                          checked={isTransactionSelected || false}
                          onChange={() =>
                            toggleTransaction(pallet, transaction)
                          }
                        />
                        <TransactionLabel>
                          {formatTransactionLabel(pallet, extrinsicName)}
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
  );
};
