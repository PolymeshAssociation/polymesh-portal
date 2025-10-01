/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  AgentTxGroup,
  CreateGroupParams,
  PermissionType,
  TxTag,
  TxTags,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import {
  ModalActions,
  ModalContainer,
  ModalContent,
  WarningMessage,
} from '../../../styles';
import type { IPermissionGroup } from '../../../types';
import { PermissionGroupSelector } from './PermissionGroupSelector';
import {
  createTransactionToGroupMap,
  IPermissionGroupForm,
  permissionGroupTransactionSchema,
} from './shared';

interface IEditPermissionGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissionGroup: IPermissionGroup | null;
  onEditGroup: (
    params: {
      groupId: BigNumber;
      permissions: CreateGroupParams['permissions'];
    } & {
      onTransactionRunning?: () => void | Promise<void>;
    },
  ) => Promise<void>;
  transactionInProcess: boolean;
}

export const EditPermissionGroupModal: React.FC<
  IEditPermissionGroupModalProps
> = ({
  isOpen,
  onClose,
  permissionGroup,
  onEditGroup,
  transactionInProcess,
}) => {
  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<IPermissionGroupForm>({
    mode: 'onChange',
    defaultValues: {
      selectedGroups: [],
      selectedTransactions: {} as Record<AgentTxGroup, string[]>,
    },
    resolver: yupResolver(permissionGroupTransactionSchema),
  });

  const watchedSelectedGroups = watch('selectedGroups');
  const watchedSelectedTransactions = watch('selectedTransactions');

  // Create reverse lookup map: transaction -> group (computed once and cached)
  const transactionToGroupMap = useMemo(
    () => createTransactionToGroupMap(),
    [],
  );

  // Initialize form with existing permission group data
  useEffect(() => {
    if (isOpen && permissionGroup) {
      const initialTransactions = {} as Record<AgentTxGroup, TxTag[]>;

      // Process existing transaction permissions
      if (permissionGroup.permissions?.transactions?.values) {
        // Collect all actual transactions that should be selected
        const transactionsToSelect: TxTag[] = [];

        permissionGroup.permissions.transactions.values.forEach((value) => {
          if (!value.toString().includes('.')) {
            // This is a module-level permission (e.g., "asset")
            // Get all transactions from this specific module directly
            const moduleEnum = TxTags[value as keyof typeof TxTags];
            if (moduleEnum) {
              const moduleTransactions = Object.values(
                moduleEnum as Record<string, TxTag>,
              );
              transactionsToSelect.push(...moduleTransactions);
            }
          } else {
            // This is a specific transaction
            transactionsToSelect.push(value as TxTag);
          }
        });

        // Now organize these transactions by their groups for the form
        transactionsToSelect.forEach((txTag) => {
          const group = transactionToGroupMap.get(txTag);
          if (group) {
            if (!initialTransactions[group]) {
              initialTransactions[group] = [];
            }
            if (!initialTransactions[group].includes(txTag)) {
              initialTransactions[group].push(txTag);
            }
          }
        });
      }

      reset({
        selectedGroups: [],
        selectedTransactions: initialTransactions,
      });
    }
  }, [isOpen, permissionGroup, reset, transactionToGroupMap]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (formData: IPermissionGroupForm) => {
      if (!permissionGroup || permissionGroup.type !== 'custom') {
        return;
      }

      // Collect all selected individual transactions
      const allSelectedTransactions = Object.values(
        formData.selectedTransactions,
      )
        .flat()
        .filter(Boolean);

      // Create permissions using individual transactions
      const permissions: CreateGroupParams['permissions'] = {
        transactions: {
          type: PermissionType.Include,
          values: allSelectedTransactions as TxTag[],
        },
      };

      await onEditGroup({
        groupId: new BigNumber(permissionGroup.id),
        permissions,
        onTransactionRunning: handleClose,
      });
    },
    [permissionGroup, onEditGroup, handleClose],
  );

  // Form validation based on transaction selection
  const selectedTransactionsCount = Object.values(
    watchedSelectedTransactions || {},
  )
    .flat()
    .filter(Boolean).length;

  const isFormValid =
    selectedTransactionsCount > 0 && !errors.selectedTransactions;

  // Don't render if no permission group is provided or it's not a custom group
  if (!isOpen || !permissionGroup || permissionGroup.type !== 'custom') {
    return null;
  }

  return (
    <Modal handleClose={handleClose} customWidth="700px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Edit Permission Group #{permissionGroup.id}
          </Heading>
          <Text marginBottom={24}>
            Modify the transaction groups for this custom permission group. This
            will update the permissions for all agents currently assigned to
            this group.
          </Text>

          <PermissionGroupSelector
            selectedGroups={watchedSelectedGroups || []}
            selectedTransactions={watchedSelectedTransactions || {}}
            transactionInProcess={transactionInProcess}
            errors={errors}
            setValue={setValue}
          />

          {/* Agent Impact Warning */}
          {permissionGroup.agentCount > 0 && (
            <WarningMessage>
              This group is currently assigned to {permissionGroup.agentCount}{' '}
              agent
              {permissionGroup.agentCount === 1 ? '' : 's'}. Changing these
              permissions will immediately affect all assigned agents.
            </WarningMessage>
          )}

          <ModalActions>
            <Button
              variant="modalSecondary"
              onClick={handleClose}
              disabled={transactionInProcess}
            >
              Cancel
            </Button>
            <Button
              variant="modalPrimary"
              onClick={handleSubmit(onSubmit)}
              disabled={!isFormValid || transactionInProcess}
            >
              Update Permission Group
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
