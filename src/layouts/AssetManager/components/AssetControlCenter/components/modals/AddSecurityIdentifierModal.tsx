/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import {
  SecurityIdentifier as SDKSecurityIdentifier,
  SecurityIdentifierType,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { SecurityIdentifier } from '../../types';

import { ModalActions, ModalContainer, ModalContent } from '../../styles';
import {
  SecurityIdentifierFormFields,
  createSecurityIdentifierSchema,
} from './SecurityIdentifierModalBase';

interface IAddSecurityIdentifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingIdentifiers: SecurityIdentifier[];
  onAddIdentifier: (
    newIdentifiers: SDKSecurityIdentifier[],
    onTransactionRunning?: () => void | Promise<void>,
  ) => Promise<void>;
  transactionInProcess: boolean;
}

export const AddSecurityIdentifierModal: React.FC<
  IAddSecurityIdentifierModalProps
> = ({
  isOpen,
  onClose,
  existingIdentifiers,
  onAddIdentifier,
  transactionInProcess,
}) => {
  // Create validation schema with duplicate checking
  const validationSchema = useMemo(
    () =>
      createSecurityIdentifierSchema({
        existingIdentifiers,
        identifierToExclude: null,
      }),
    [existingIdentifiers],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SDKSecurityIdentifier>({
    mode: 'onChange',
    defaultValues: {
      type: SecurityIdentifierType.Isin,
      value: '',
    },
    resolver: yupResolver(validationSchema),
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (formData: SDKSecurityIdentifier) => {
      // Convert existing identifiers to SDK format
      const existingSDKIdentifiers: SDKSecurityIdentifier[] =
        existingIdentifiers.map((identifier) => ({
          type: identifier.type as SecurityIdentifierType,
          value: identifier.value,
        }));

      // Create a new SDK identifier
      const newSDKIdentifier: SDKSecurityIdentifier = {
        type: formData.type,
        value: formData.value.trim(),
      };

      // Combine existing identifiers with the new one
      const updatedIdentifiers = [...existingSDKIdentifiers, newSDKIdentifier];

      await onAddIdentifier(updatedIdentifiers, handleClose);
    },
    [existingIdentifiers, onAddIdentifier, handleClose],
  );

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Add Security Identifier
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
              disabled={!!errors.type || !!errors.value || transactionInProcess}
            >
              Add Identifier
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
