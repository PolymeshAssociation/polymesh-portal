/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import {
  SecurityIdentifier as SDKSecurityIdentifier,
  SecurityIdentifierType,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { SecurityIdentifier } from '../../types';

import { ModalActions, ModalContainer, ModalContent } from '../../styles';
import {
  SecurityIdentifierFormFields,
  createSecurityIdentifierSchema,
} from './SecurityIdentifierModalBase';

interface IEditSecurityIdentifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  identifierToEdit: SecurityIdentifier | null;
  allIdentifiers: SecurityIdentifier[];
  onEditIdentifier: (
    updatedIdentifiers: SDKSecurityIdentifier[],
    onTransactionRunning?: () => void | Promise<void>,
  ) => Promise<void>;
  transactionInProcess: boolean;
}

export const EditSecurityIdentifierModal: React.FC<
  IEditSecurityIdentifierModalProps
> = ({
  isOpen,
  onClose,
  identifierToEdit,
  allIdentifiers,
  onEditIdentifier,
  transactionInProcess,
}) => {
  // Create validation schema with duplicate checking, excluding the current identifier
  const validationSchema = useMemo(
    () =>
      createSecurityIdentifierSchema({
        existingIdentifiers: allIdentifiers,
        identifierToExclude: identifierToEdit,
      }),
    [allIdentifiers, identifierToEdit],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<SDKSecurityIdentifier>({
    mode: 'onChange',
    defaultValues: {
      type: SecurityIdentifierType.Isin,
      value: '',
    },
    resolver: yupResolver(validationSchema),
  });

  // Watch form values to detect changes
  const formValues = watch();

  // Check if form values have changed from the original
  const hasChanges = useMemo(() => {
    if (!identifierToEdit) return false;
    return (
      formValues.type !== identifierToEdit.type ||
      formValues.value !== identifierToEdit.value
    );
  }, [formValues, identifierToEdit]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (formData: SDKSecurityIdentifier) => {
      if (!identifierToEdit) return;

      // Convert all identifiers to SDK format, updating the one being edited
      const updatedSDKIdentifiers: SDKSecurityIdentifier[] = allIdentifiers.map(
        (identifier) => {
          if (identifier.id === identifierToEdit.id) {
            return {
              type: formData.type,
              value: formData.value.trim(),
            };
          }
          return {
            type: identifier.type as SecurityIdentifierType,
            value: identifier.value,
          };
        },
      );

      await onEditIdentifier(updatedSDKIdentifiers, handleClose);
    },
    [identifierToEdit, allIdentifiers, onEditIdentifier, handleClose],
  );

  // Update form values when modal opens or identifier changes
  useEffect(() => {
    if (isOpen && identifierToEdit) {
      reset({
        type: identifierToEdit.type as SecurityIdentifierType,
        value: identifierToEdit.value,
      });
    }
  }, [isOpen, identifierToEdit, reset]);

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Edit Security Identifier
          </Heading>

          <SecurityIdentifierFormFields
            register={register}
            errors={errors}
            transactionInProcess={transactionInProcess}
            onSubmit={handleSubmit(onSubmit)}
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
              disabled={
                !!errors.type ||
                !!errors.value ||
                !hasChanges ||
                transactionInProcess
              }
            >
              Update Identifier
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
