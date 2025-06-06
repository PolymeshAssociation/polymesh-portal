/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { IAssetDetails } from '~/context/AssetContext/constants';

import { ModalContainer, ModalContent, ModalActions } from '../../styles';
import {
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldWrapper,
  StyledErrorMessage,
} from '../../../CreateAssetWizard/styles';

interface IEditNameForm {
  name: string;
}

interface IEditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: IAssetDetails;
  onModifyAssetName: (
    name: string,
    onTransactionRunning?: () => void | Promise<void>,
  ) => Promise<void>;
  transactionInProcess: boolean;
}

export const EditNameModal: React.FC<IEditNameModalProps> = ({
  isOpen,
  onClose,
  asset,
  onModifyAssetName,
  transactionInProcess,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IEditNameForm>({
    mode: 'onChange',
    defaultValues: {
      name: asset.details?.name || '',
    },
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (formData: IEditNameForm) => {
      await onModifyAssetName(formData.name.trim(), handleClose);
    },
    [onModifyAssetName, handleClose],
  );

  // Update form values when modal opens or asset changes
  useEffect(() => {
    if (isOpen) {
      reset({
        name: asset.details?.name || '',
      });
    }
  }, [isOpen, asset.details?.name, reset]);

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Modify Asset Name
          </Heading>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Asset Name</FieldLabel>
              <FieldInput
                type="text"
                placeholder="Enter asset name"
                $hasError={!!errors.name}
                disabled={transactionInProcess}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(onSubmit)();
                  }
                }}
                {...register('name', {
                  required: 'Asset name is required',
                  maxLength: {
                    value: 64,
                    message: 'Asset name must be 64 characters or less',
                  },
                })}
              />
            </FieldRow>

            {errors.name && (
              <StyledErrorMessage>{errors.name.message}</StyledErrorMessage>
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
              variant="modalPrimary"
              onClick={handleSubmit(onSubmit)}
              disabled={!!errors.name || transactionInProcess}
            >
              {asset.details?.name ? 'Update Name' : 'Set Name'}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
