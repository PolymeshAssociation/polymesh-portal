/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useCallback, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { TransferAssetOwnershipParams } from '@polymeshassociation/polymesh-sdk/types';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';

import {
  ModalContainer,
  ModalContent,
  ModalActions,
  InputInfoNote,
} from '../../styles';
import {
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldWrapper,
  StyledErrorMessage,
} from '../../../CreateAssetWizard/styles';

interface ITransferOwnershipForm {
  targetDid: string;
}

interface ITransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferOwnership: ({
    target,
    onTransactionRunning,
  }: TransferAssetOwnershipParams & {
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

export const TransferOwnershipModal: React.FC<ITransferOwnershipModalProps> = ({
  isOpen,
  onClose,
  onTransferOwnership,
  transactionInProcess,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const [identityError, setIdentityError] = useState('');

  // Ref for tracking validation calls to prevent race conditions
  const validationCounterRef = useRef(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ITransferOwnershipForm>({
    mode: 'onBlur',
    defaultValues: {
      targetDid: '',
    },
  });

  const watchedTargetDid = watch('targetDid');

  // Validate DID
  const validateDid = useCallback(
    async (did: string) => {
      // Increment counter and get current validation ID
      validationCounterRef.current += 1;
      const validationId = validationCounterRef.current;

      if (!did.length) {
        setIdentityError('DID is required');
        return false;
      }

      if (!/^0x[0-9a-fA-F]{64}$/.test(did)) {
        setIdentityError('DID must be valid');
        return false;
      }

      if (!sdk) {
        setIdentityError('SDK not available');
        return false;
      }

      try {
        const didExists = await sdk.identities.isIdentityValid({
          identity: did,
        });

        // Only update state if this is still the latest validation
        if (validationId === validationCounterRef.current) {
          if (!didExists) {
            setIdentityError('Identity does not exist');
            return false;
          }

          setIdentityError('');
          return true;
        }

        // Return the validation result even if we don't update state
        return didExists;
      } catch (error) {
        if (validationId === validationCounterRef.current) {
          setIdentityError('Failed to validate identity');
        }
        return false;
      }
    },
    [sdk],
  );

  // Handle DID input blur
  const handleDidBlur = useCallback(
    async (did: string) => {
      if (!sdk) return;

      const trimmedDid = did.trim();
      await validateDid(trimmedDid);
    },
    [sdk, validateDid],
  );

  const handleClose = useCallback(() => {
    reset();
    setIdentityError('');
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (formData: ITransferOwnershipForm) => {
      const trimmedDid = formData.targetDid.trim();

      // Validate DID before submitting
      const isValidDid = await validateDid(trimmedDid);
      if (!isValidDid) {
        return;
      }

      await onTransferOwnership({
        target: trimmedDid,
        onTransactionRunning: handleClose,
      });
    },
    [validateDid, onTransferOwnership, handleClose],
  );

  const isFormValid =
    !errors.targetDid && !identityError && watchedTargetDid.trim();

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Transfer Asset Ownership
          </Heading>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Target DID</FieldLabel>
              <FieldInput
                type="text"
                placeholder="0x..."
                $hasError={!!(errors.targetDid || identityError)}
                disabled={transactionInProcess}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (isFormValid) {
                      handleSubmit(onSubmit)();
                    }
                  }
                }}
                {...register('targetDid', {
                  required: 'DID is required',
                  pattern: {
                    value: /^0x[0-9a-fA-F]{64}$/,
                    message: 'DID must be valid',
                  },
                  onBlur: (e) => handleDidBlur(e.target.value),
                })}
              />
            </FieldRow>

            {/* Validation Error */}
            {(errors.targetDid || identityError) && (
              <StyledErrorMessage>
                {errors.targetDid?.message || identityError}
              </StyledErrorMessage>
            )}
          </FieldWrapper>

          <InputInfoNote>
            <strong>Note:</strong> This action will create an authorization
            request that must be accepted by the target identity before
            ownership transfers.
          </InputInfoNote>

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
              Transfer Ownership
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
