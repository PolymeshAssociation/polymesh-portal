/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  MetadataEntry,
  MetadataLockStatus,
  MetadataType,
  SetMetadataParams,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { notifyError } from '~/helpers/notifications';
import {
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldWrapper,
  StyledErrorMessage,
} from '../../../CreateAssetWizard/styles';
import { ModalActions, ModalContainer, ModalContent } from '../../styles';

interface IEditMetadataForm {
  value: string;
  expiry?: string;
  lockStatus?: MetadataLockStatus;
  lockedUntil?: string;
}

interface IEditMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadataEntry: MetadataEntry | null;
  onSetMetadata: (params: {
    id: BigNumber;
    type: MetadataType;
    params: SetMetadataParams;
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

// Validation schema
const validationSchema = yup.object().shape({
  value: yup.string().required('Metadata value is required'),
  expiry: yup.string().optional(),
  lockedUntil: yup.string().when('lockStatus', {
    is: MetadataLockStatus.LockedUntil,
    then: (schema) => schema.required('Locked until date is required'),
    otherwise: (schema) => schema.optional(),
  }),
  lockStatus: yup.string().optional(),
});

export const EditMetadataModal: React.FC<IEditMetadataModalProps> = ({
  isOpen,
  onClose,
  metadataEntry,
  onSetMetadata,
  transactionInProcess,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<IEditMetadataForm>({
    mode: 'onChange',
    defaultValues: {
      value: '',
      expiry: '',
      lockStatus: MetadataLockStatus.Unlocked,
      lockedUntil: '',
    },
    resolver: yupResolver(validationSchema),
  });

  // Load current value when modal opens
  useEffect(() => {
    if (isOpen && metadataEntry) {
      const loadValue = async () => {
        try {
          const value = await metadataEntry.value();

          // Pre-populate form with current values
          const lockStatus = value?.lockStatus || MetadataLockStatus.Unlocked;

          reset({
            value: value?.value || '',
            expiry: value?.expiry
              ? new Date(value.expiry).toISOString().slice(0, 16)
              : '',
            lockStatus,
            lockedUntil:
              value?.lockStatus === MetadataLockStatus.LockedUntil &&
              value?.lockedUntil
                ? new Date(value.lockedUntil).toISOString().slice(0, 16)
                : '',
          });
        } catch (error) {
          notifyError((error as Error).message);
        }
      };

      loadValue();
    }
  }, [isOpen, metadataEntry, reset]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const watchLockStatus = watch('lockStatus');
  const watchedValue = watch('value');

  // Clear locked until date when lock status changes
  useEffect(() => {
    setValue('lockedUntil', '');
  }, [watchLockStatus, setValue]);

  const onSubmit = useCallback(
    async (formData: IEditMetadataForm) => {
      if (!metadataEntry) return;

      try {
        const trimmedValue = formData.value?.trim();

        // SetMetadataParams requires a value
        if (!trimmedValue) {
          return;
        }

        const details = {
          lockStatus: formData.lockStatus,
          lockedUntil: formData.lockedUntil
            ? new Date(formData.lockedUntil)
            : undefined,
          expiry: formData.expiry ? new Date(formData.expiry) : undefined,
        } as SetMetadataParams['details'];

        await onSetMetadata({
          id: metadataEntry.id,
          type: metadataEntry.type,
          params: {
            value: trimmedValue,
            details,
          },
          onTransactionRunning: handleClose,
        });
      } catch (error) {
        notifyError((error as Error).message);
      }
    },
    [metadataEntry, onSetMetadata, handleClose],
  );

  const lockStatusOptions = useMemo(
    () => [
      { value: MetadataLockStatus.Unlocked, label: 'Not Locked' },
      { value: MetadataLockStatus.Locked, label: 'Locked Permanently' },
      { value: MetadataLockStatus.LockedUntil, label: 'Locked Until Date' },
    ],
    [],
  );

  if (!isOpen || !metadataEntry) return null;

  return (
    <Modal handleClose={handleClose} customWidth="700px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Edit Metadata Value
          </Heading>
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>ID</FieldLabel>
              <FieldLabel>
                {metadataEntry.type} - {metadataEntry.id.toString()}
              </FieldLabel>
            </FieldRow>
          </FieldWrapper>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldWrapper>
              <FieldRow>
                <FieldLabel htmlFor="value">Metadata Value</FieldLabel>
                <FieldInput
                  type="text"
                  id="value"
                  placeholder="Enter metadata value"
                  {...register('value')}
                  $hasError={!!errors.value}
                />
              </FieldRow>
              {errors.value && (
                <StyledErrorMessage>{errors.value.message}</StyledErrorMessage>
              )}
            </FieldWrapper>

            <FieldWrapper>
              <FieldRow>
                <FieldLabel htmlFor="lockStatus">Lock Status</FieldLabel>
                <FieldSelect
                  id="lockStatus"
                  {...register('lockStatus')}
                  $hasError={!!errors.lockStatus}
                  disabled={!watchedValue?.trim()}
                >
                  {lockStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FieldSelect>
              </FieldRow>
              {errors.lockStatus && (
                <StyledErrorMessage>
                  {errors.lockStatus.message}
                </StyledErrorMessage>
              )}
            </FieldWrapper>

            {watchLockStatus === MetadataLockStatus.LockedUntil && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel htmlFor="lockedUntil">
                    Locked Until Date
                  </FieldLabel>
                  <FieldInput
                    type="datetime-local"
                    id="lockedUntil"
                    {...register('lockedUntil')}
                    $hasError={!!errors.lockedUntil}
                    disabled={!watchedValue?.trim()}
                  />
                </FieldRow>
                {errors.lockedUntil && (
                  <StyledErrorMessage>
                    {errors.lockedUntil.message}
                  </StyledErrorMessage>
                )}
              </FieldWrapper>
            )}

            <FieldWrapper>
              <FieldRow>
                <FieldLabel htmlFor="expiry">Expiry Date (optional)</FieldLabel>
                <FieldInput
                  type="datetime-local"
                  id="expiry"
                  {...register('expiry')}
                  $hasError={!!errors.expiry}
                  disabled={!watchedValue?.trim()}
                />
              </FieldRow>
              {errors.expiry && (
                <StyledErrorMessage>{errors.expiry.message}</StyledErrorMessage>
              )}
            </FieldWrapper>

            <ModalActions>
              <Button
                variant="modalSecondary"
                onClick={handleClose}
                disabled={transactionInProcess}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                variant="modalPrimary"
                disabled={
                  transactionInProcess || Object.keys(errors).length > 0
                }
              >
                {transactionInProcess ? 'Updating...' : 'Update Metadata'}
              </Button>
            </ModalActions>
          </form>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
