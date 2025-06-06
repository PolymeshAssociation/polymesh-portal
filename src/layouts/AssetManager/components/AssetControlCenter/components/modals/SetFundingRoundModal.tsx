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

interface ISetFundingRoundForm {
  fundingRound: string;
}

interface ISetFundingRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: IAssetDetails;
  onModifyFundingRound: (
    fundingRound: string,
    onTransactionRunning?: () => void | Promise<void>,
  ) => Promise<void>;
  transactionInProcess: boolean;
}

export const SetFundingRoundModal: React.FC<ISetFundingRoundModalProps> = ({
  isOpen,
  onClose,
  asset,
  onModifyFundingRound,
  transactionInProcess,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ISetFundingRoundForm>({
    mode: 'onChange',
    defaultValues: {
      fundingRound: asset.details?.fundingRound || '',
    },
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (formData: ISetFundingRoundForm) => {
      await onModifyFundingRound(formData.fundingRound.trim(), handleClose);
    },
    [onModifyFundingRound, handleClose],
  );

  // Update form values when modal opens or asset changes
  useEffect(() => {
    if (isOpen) {
      reset({
        fundingRound: asset.details?.fundingRound || '',
      });
    }
  }, [isOpen, asset.details?.fundingRound, reset]);

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Modify Funding Round
          </Heading>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Funding Round</FieldLabel>
              <FieldInput
                type="text"
                placeholder="Enter a Funding Round Name"
                $hasError={!!errors.fundingRound}
                disabled={transactionInProcess}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(onSubmit)();
                  }
                }}
                {...register('fundingRound', {
                  required: 'Funding round is required',
                  maxLength: {
                    value: 64,
                    message: 'Funding round must be 64 characters or less',
                  },
                })}
              />
            </FieldRow>

            {errors.fundingRound && (
              <StyledErrorMessage>
                {errors.fundingRound.message}
              </StyledErrorMessage>
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
              disabled={!!errors.fundingRound || transactionInProcess}
            >
              Set Funding Round
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
