/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useContext } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import {
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldWrapper,
  StyledErrorMessage,
  StyledLink,
} from '../../../CreateAssetWizard/styles';
import { useAssetActionsContext } from '../../context';
import { ModalActions, ModalContainer, ModalContent } from '../../styles';

const DID_PATTERN = /^0x[0-9a-fA-F]{64}$/;

interface IMediatorFormData {
  mediator: string;
}

interface IAddMediatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMediatorModal: React.FC<IAddMediatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { addRequiredMediators, transactionInProcess } =
    useAssetActionsContext();

  const validationSchema = yup.object().shape({
    mediator: yup
      .string()
      .required('Mediator DID is required')
      .matches(DID_PATTERN, 'Mediator DID must be valid')
      .test(
        'is-valid-identity',
        'Mediator DID does not exist',
        async function validateDid(value) {
          if (!value || !value.match(DID_PATTERN)) return true;
          if (!sdk) return false;
          try {
            const isValid = await sdk.identities.isIdentityValid({
              identity: value,
            });
            return isValid;
          } catch {
            return false;
          }
        },
      ),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<IMediatorFormData>({
    mode: 'onBlur',
    defaultValues: {
      mediator: '',
    },
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: IMediatorFormData) => {
    try {
      await addRequiredMediators({
        mediators: [data.mediator],
      });
      reset({ mediator: '' });
      onClose();
    } catch (error) {
      notifyError(
        `Error adding mediator: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  const resetForm = useCallback(() => {
    reset({ mediator: '' });
  }, [reset]);

  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  if (!isOpen) return null;

  return (
    <Modal handleClose={onClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Add Required Mediator
          </Heading>
          <Text>
            Mediators are entities that must approve settlement instructions
            involving this asset before execution. They provide additional
            control and validation for scenarios requiring third-party
            verification. Common examples include transfer agents, compliance
            validators, or regulatory oversight entities.
          </Text>
          <Text marginTop={12} marginBottom={24}>
            <StyledLink
              href="https://developers.polymesh.network/settlement/mediators/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about mediators
            </StyledLink>{' '}
            in the Polymesh documentation.
          </Text>
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Mediator DID</FieldLabel>
              <FieldInput
                type="text"
                placeholder="0x..."
                $hasError={!!errors?.mediator}
                disabled={transactionInProcess}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (isValid) {
                      handleSubmit(onSubmit)();
                    }
                  }
                }}
                {...register('mediator')}
              />
            </FieldRow>

            {errors?.mediator && (
              <StyledErrorMessage>{errors.mediator.message}</StyledErrorMessage>
            )}
          </FieldWrapper>

          <ModalActions>
            <Button
              variant="modalSecondary"
              onClick={onClose}
              disabled={transactionInProcess}
            >
              Cancel
            </Button>
            <Button
              variant="modalPrimary"
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || transactionInProcess}
            >
              Add Mediator
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
