/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import type {
  AgentTxGroup,
  CreateGroupParams,
  TxTag,
} from '@polymeshassociation/polymesh-sdk/types';
import { PermissionType } from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { ModalActions, ModalContainer, ModalContent } from '../../../styles';
import { PermissionGroupSelector } from './PermissionGroupSelector';
import {
  IPermissionGroupForm,
  permissionGroupTransactionSchema,
} from './shared';

interface ICreatePermissionGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (
    params: CreateGroupParams & {
      onTransactionRunning?: () => void | Promise<void>;
    },
  ) => Promise<void>;
  transactionInProcess: boolean;
}

export const CreatePermissionGroupModal: React.FC<
  ICreatePermissionGroupModalProps
> = ({ isOpen, onClose, onCreateGroup, transactionInProcess }) => {
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

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (formData: IPermissionGroupForm) => {
      // Collect all selected individual transactions
      const allSelectedTransactions = Object.values(
        formData.selectedTransactions,
      )
        .flat()
        .filter(Boolean);

      await onCreateGroup({
        permissions: {
          transactions: {
            type: PermissionType.Include,
            values: allSelectedTransactions as TxTag[],
          },
        },
        onTransactionRunning: handleClose,
      });
    },
    [onCreateGroup, handleClose],
  );

  // Form validation based on transaction selection
  const selectedTransactionsCount = Object.values(
    watchedSelectedTransactions || {},
  )
    .flat()
    .filter(Boolean).length;

  const isFormValid =
    selectedTransactionsCount > 0 && !errors.selectedTransactions;

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="700px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Create Permission Group
          </Heading>
          <Text marginBottom={24}>
            Create a custom permission group by selecting transaction groups.
            This group can then be assigned to asset agents to define their
            specific permissions.
          </Text>

          <PermissionGroupSelector
            selectedGroups={watchedSelectedGroups || []}
            selectedTransactions={watchedSelectedTransactions || {}}
            transactionInProcess={transactionInProcess}
            errors={errors}
            setValue={setValue}
          />

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
              Create Permission Group
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
