/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import {
  TransferRestrictionClaimCountInput,
  TransferRestrictionInputClaimPercentage,
  TransferRestrictionInputCount,
  TransferRestrictionInputPercentage,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import {
  DescriptionText,
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldWrapper,
  StyledErrorMessage,
} from '../../../CreateAssetWizard/styles';
import { ModalActions, ModalContainer, ModalContent } from '../../styles';
import { filterToDecimalInput, filterToIntegerInput } from './helpers';
import {
  DisplayRestriction,
  EditTransferRestrictionForm,
  displayRestrictionToSdkFormat,
  getClaimTypeDescription,
  getRestrictionTypeDescription,
} from './transferRestrictionHelpers';
import { createEditTransferRestrictionValidationSchema } from './validation';

interface EditTransferRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  restrictionToEdit: DisplayRestriction | null;
  onEditRestriction: (params: {
    restrictions: (
      | TransferRestrictionInputCount
      | TransferRestrictionInputPercentage
      | TransferRestrictionClaimCountInput
      | TransferRestrictionInputClaimPercentage
    )[];
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

export const EditTransferRestrictionModal: React.FC<
  EditTransferRestrictionModalProps
> = ({
  isOpen,
  onClose,
  restrictionToEdit,
  onEditRestriction,
  transactionInProcess,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const isPercentage =
    restrictionToEdit?.type === 'Percentage' ||
    restrictionToEdit?.type === 'ClaimPercentage';
  const isScoped =
    restrictionToEdit?.type === 'ClaimCount' ||
    restrictionToEdit?.type === 'ClaimPercentage';

  const validationSchema = useMemo(
    () =>
      restrictionToEdit
        ? createEditTransferRestrictionValidationSchema(restrictionToEdit.type)
        : null,
    [restrictionToEdit],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditTransferRestrictionForm>({
    mode: 'onChange',
    defaultValues: {
      max: '',
      min: '',
    },
    resolver: yupResolver(validationSchema),
  });

  const countryLookup = useMemo(
    () => new Map(countryCodes.map((c) => [c.code, c.name])),
    [],
  );

  // Load current values when modal opens
  useEffect(() => {
    if (isOpen && restrictionToEdit) {
      reset({
        max: restrictionToEdit.maxLimit || '',
        min: restrictionToEdit.minLimit || '',
      });
    }
  }, [isOpen, restrictionToEdit, reset]);

  const handleClose = useCallback(() => {
    reset({
      max: '',
      min: '',
    });
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (data: EditTransferRestrictionForm) => {
      if (!sdk || !restrictionToEdit) {
        notifyError('SDK or restriction data not available');
        return;
      }

      try {
        // Convert edited data to SDK format
        const updatedRestriction = await displayRestrictionToSdkFormat(
          restrictionToEdit,
          data,
          sdk,
        );

        // Pass the updated restriction
        await onEditRestriction({
          restrictions: [updatedRestriction],
          onTransactionRunning: handleClose,
        });
      } catch (error) {
        notifyError(
          `Failed to edit transfer restriction: ${(error as Error).message}`,
        );
      }
    },
    [sdk, restrictionToEdit, onEditRestriction, handleClose],
  );

  if (!isOpen || !restrictionToEdit) return null;

  return (
    <Modal handleClose={handleClose} customWidth="700px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={16}>
            Edit Transfer Restriction
          </Heading>
          <DescriptionText>
            Update the limits for this transfer restriction. For more
            information, visit the Polymesh Transfer Restrictions Documentation.
          </DescriptionText>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Read-only: Restriction Type */}
            <FieldWrapper>
              <FieldRow>
                <FieldLabel>Restriction Type</FieldLabel>
                <FieldInput
                  type="text"
                  value={getRestrictionTypeDescription(restrictionToEdit.type)}
                  disabled
                />
              </FieldRow>
            </FieldWrapper>

            {/* Read-only: Claim Type (for scoped restrictions) */}
            {isScoped && restrictionToEdit.claimType && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Claim Type</FieldLabel>
                  <FieldInput
                    type="text"
                    value={getClaimTypeDescription(
                      restrictionToEdit.claimType,
                      restrictionToEdit.claimDetails || {},
                    )}
                    disabled
                  />
                </FieldRow>
              </FieldWrapper>
            )}

            {/* Read-only: Jurisdiction (for Jurisdiction claim type) */}
            {isScoped && restrictionToEdit.claimType === 'Jurisdiction' && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Jurisdiction</FieldLabel>
                  <FieldInput
                    type="text"
                    value={
                      restrictionToEdit.claimDetails?.countryCode
                        ? countryLookup.get(
                            restrictionToEdit.claimDetails.countryCode,
                          ) || restrictionToEdit.claimDetails.countryCode
                        : 'No Jurisdiction'
                    }
                    disabled
                  />
                </FieldRow>
              </FieldWrapper>
            )}

            {/* Read-only: Claim Issuer (for scoped restrictions) */}
            {isScoped && restrictionToEdit.claimIssuer && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Claim Issuer DID</FieldLabel>
                  <FieldInput
                    type="text"
                    value={restrictionToEdit.claimIssuer}
                    disabled
                  />
                </FieldRow>
              </FieldWrapper>
            )}

            {/* Editable: Min Value (for scoped restrictions) */}
            {isScoped && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>
                    Minimum {isPercentage ? 'Percentage' : 'Count'}
                  </FieldLabel>
                  <FieldInput
                    type="text"
                    placeholder={`Enter minimum ${isPercentage ? 'percentage' : 'count'} (optional)`}
                    {...register('min')}
                    onInput={
                      isPercentage ? filterToDecimalInput : filterToIntegerInput
                    }
                    $hasError={!!errors.min}
                  />
                </FieldRow>
                {errors.min && (
                  <StyledErrorMessage>{errors.min.message}</StyledErrorMessage>
                )}
                <Text size="small" marginTop={8}>
                  Optional: Set a minimum value. If not provided, defaults to 0.
                </Text>
              </FieldWrapper>
            )}

            {/* Editable: Max Value */}
            <FieldWrapper>
              <FieldRow>
                <FieldLabel>
                  Maximum {isPercentage ? 'Percentage' : 'Count'}
                </FieldLabel>
                <FieldInput
                  type="text"
                  placeholder={`Enter maximum ${isPercentage ? 'percentage (0-100)' : 'count'}`}
                  {...register('max')}
                  onInput={
                    isPercentage ? filterToDecimalInput : filterToIntegerInput
                  }
                  $hasError={!!errors.max}
                />
              </FieldRow>
              {errors.max && (
                <StyledErrorMessage>{errors.max.message}</StyledErrorMessage>
              )}
            </FieldWrapper>
          </form>
        </ModalContent>

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
            disabled={transactionInProcess}
          >
            Update Restriction
          </Button>
        </ModalActions>
      </ModalContainer>
    </Modal>
  );
};
