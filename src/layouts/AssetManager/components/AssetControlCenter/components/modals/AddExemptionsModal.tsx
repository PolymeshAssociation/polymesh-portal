/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import type { TransferRestrictionExemptionParams } from '@polymeshassociation/polymesh-sdk/types';
import { ClaimType, StatType } from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useContext, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Icon, Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import {
  DescriptionText,
  FieldInput,
  FieldInputWithButton,
  FieldLabel,
  FieldRow,
  FieldWrapper,
  IconWrapper,
  StyledErrorMessage,
} from '../../../CreateAssetWizard/styles';
import {
  FieldActionButton,
  ModalActions,
  ModalContainer,
  ModalContent,
} from '../../styles';
import {
  DisplayRestriction,
  getFullRestrictionLabel,
} from './transferRestrictionHelpers';
import { createAddExemptionsValidationSchema } from './validation';

interface IAddExemptionsModalProps {
  onClose: () => void;
  restriction: DisplayRestriction | null;
  onAddExemptions: (params: {
    exemptions: TransferRestrictionExemptionParams;
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
}

interface AddExemptionsForm {
  identities: { identity: string }[];
}

export const AddExemptionsModal: React.FC<IAddExemptionsModalProps> = ({
  onClose,
  restriction,
  onAddExemptions,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const validationSchema = useMemo(
    () =>
      sdk &&
      createAddExemptionsValidationSchema(sdk, restriction?.exemptedDids || []),
    [sdk, restriction?.exemptedDids],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<AddExemptionsForm>({
    mode: 'onChange',
    defaultValues: {
      identities: [{ identity: '' }],
    },
    resolver: yupResolver(validationSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'identities',
  });

  const watchedIdentities = watch('identities');

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (data: AddExemptionsForm) => {
      if (!restriction) {
        notifyError('No restriction selected');
        return;
      }

      try {
        const identities = data.identities.map((item) => item.identity);

        // Build exemption params based on restriction type
        const exemptionParams: TransferRestrictionExemptionParams =
          restriction.type === 'Count' || restriction.type === 'Percentage'
            ? {
                type:
                  restriction.type === 'Count'
                    ? StatType.Count
                    : StatType.Balance,
                identities,
              }
            : {
                type:
                  restriction.type === 'ClaimCount'
                    ? StatType.ScopedCount
                    : StatType.ScopedBalance,
                identities,
                claim: restriction.claimType as ClaimType,
              };

        await onAddExemptions({
          exemptions: exemptionParams,
          onTransactionRunning: handleClose,
        });
      } catch (error) {
        notifyError(`Failed to add exemptions: ${(error as Error).message}`);
      }
    },
    [restriction, onAddExemptions, handleClose],
  );

  // Get restriction type description matching TransferRestrictionsSection
  const restrictionTypeLabel = useMemo(() => {
    if (!restriction) return '';
    return getFullRestrictionLabel(restriction);
  }, [restriction]);

  // Dynamic exemption explanation based on restriction type
  const exemptionExplanation = useMemo(() => {
    if (!restriction) return '';

    const isCountBased =
      restriction.type === 'Count' || restriction.type === 'ClaimCount';
    const isBalanceBased =
      restriction.type === 'Percentage' ||
      restriction.type === 'ClaimPercentage';

    if (isCountBased) {
      return 'Count exemptions apply to the sender. Exempt senders can transfer tokens to new investors even if the holder count limit has been reached.';
    }

    if (isBalanceBased) {
      return 'Ownership exemptions apply to the receiver. Exempt receivers can receive tokens even if it would cause them to exceed the ownership percentage limit.';
    }

    return '';
  }, [restriction]);

  if (!restriction) return null;

  return (
    <Modal handleClose={handleClose} customWidth="600px">
      <ModalContainer>
        <Heading type="h4">Add Exempted Identities</Heading>
        <ModalContent>
          <DescriptionText>{exemptionExplanation}</DescriptionText>

          {/* Restriction Info */}
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Restriction</FieldLabel>
              <Text bold>{restrictionTypeLabel}</Text>
            </FieldRow>
          </FieldWrapper>

          {/* Identities to Exempt */}
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Identities to Exempt</FieldLabel>
              <FieldActionButton
                type="button"
                onClick={() => append({ identity: '' })}
                title="Add another identity"
              >
                <Icon name="Plus" size="20px" />
                Add Identity
              </FieldActionButton>
            </FieldRow>
          </FieldWrapper>

          {fields.map((field, index) => (
            <FieldWrapper key={field.id}>
              <FieldRow>
                <FieldInputWithButton>
                  <FieldInput
                    placeholder="Enter identity DID (0x...)"
                    {...register(`identities.${index}.identity`)}
                    value={watchedIdentities?.[index]?.identity || ''}
                    $hasError={!!errors.identities?.[index]?.identity}
                  />
                  {fields.length > 1 && (
                    <IconWrapper onClick={() => remove(index)}>
                      <Icon name="Delete" size="20px" />
                    </IconWrapper>
                  )}
                </FieldInputWithButton>
              </FieldRow>
              {errors.identities?.[index]?.identity && (
                <StyledErrorMessage>
                  {errors.identities[index].identity.message}
                </StyledErrorMessage>
              )}
            </FieldWrapper>
          ))}
        </ModalContent>

        <ModalActions>
          <Button variant="modalSecondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="modalPrimary"
            onClick={handleSubmit(onSubmit)}
            disabled={
              fields.length === 0 ||
              !watchedIdentities?.some((item) => item?.identity?.trim())
            }
          >
            Add Exemptions
          </Button>
        </ModalActions>
      </ModalContainer>
    </Modal>
  );
};
