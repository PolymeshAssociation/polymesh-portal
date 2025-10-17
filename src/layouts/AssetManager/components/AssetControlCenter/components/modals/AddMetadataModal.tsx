/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  MetadataLockStatus,
  MetadataType,
  MetadataValueDetails,
  RegisterMetadataParams,
  SetMetadataParams,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { AssetContext } from '~/context/AssetContext';
import { notifyError } from '~/helpers/notifications';
import {
  DescriptionText,
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldTextarea,
  FieldWrapper,
  HeaderRow,
  StyledErrorMessage,
  StyledLink,
} from '../../../CreateAssetWizard/styles';
import { ModalActions, ModalContainer, ModalContent } from '../../styles';

type IAddMetadataForm =
  | {
      keyType: 'global';
      globalKeyId: string;
      value: string;
      expiry?: string;
      lockedUntil?: string;
      lockStatus?: MetadataLockStatus;
    }
  | {
      keyType: 'local';
      localKeyName: string;
      localKeyDescription?: string;
      localKeyTypeDef?: string;
      localKeyUrl?: string;
      value?: string;
      expiry?: string;
      lockedUntil?: string;
      lockStatus?: MetadataLockStatus;
    };

// Helper type to access errors from both union variants
type AllFormFields = {
  keyType?: string;
  globalKeyId?: string;
  localKeyName?: string;
  localKeyDescription?: string;
  localKeyTypeDef?: string;
  localKeyUrl?: string;
  value?: string;
  expiry?: string;
  lockedUntil?: string;
  lockStatus?: MetadataLockStatus;
};

interface IAddMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterMetadata: (
    params: RegisterMetadataParams & {
      onTransactionRunning?: () => void | Promise<void>;
    },
  ) => Promise<void>;
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
  keyType: yup.string().required('Metadata key type is required'),
  globalKeyId: yup.string().when('keyType', {
    is: 'global',
    then: (schema) => schema.required('Global key selection is required'),
    otherwise: (schema) => schema.optional(),
  }),
  localKeyName: yup.string().when('keyType', {
    is: 'local',
    then: (schema) =>
      schema
        .required('Local key name is required')
        .max(256, 'Key name must be at most 256 characters'),
    otherwise: (schema) => schema.optional(),
  }),
  localKeyDescription: yup
    .string()
    .max(1024, 'Description must be at most 1024 characters')
    .optional(),
  localKeyTypeDef: yup.string().optional(),
  localKeyUrl: yup.string().url('Must be a valid URL').optional(),
  value: yup.string().when('keyType', {
    is: 'global',
    then: (schema) => schema.required('Value is required for global metadata'),
    otherwise: (schema) => schema.optional(),
  }),
  expiry: yup.string().optional(),
  lockedUntil: yup.string().when('lockStatus', {
    is: MetadataLockStatus.LockedUntil,
    then: (schema) => schema.required('Locked until date is required'),
    otherwise: (schema) => schema.optional(),
  }),
  lockStatus: yup.string().optional(),
});

export const AddMetadataModal: React.FC<IAddMetadataModalProps> = ({
  isOpen,
  onClose,
  onRegisterMetadata,
  onSetMetadata,
  transactionInProcess,
}) => {
  const { globalMetadata } = useContext(AssetContext);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    reset,
    watch,
    setValue,
  } = useForm<IAddMetadataForm>({
    mode: 'onChange',
    defaultValues: {
      keyType: 'local',
      localKeyName: '',
      localKeyDescription: '',
      localKeyTypeDef: '',
      localKeyUrl: '',
      value: '',
      expiry: '',
      lockedUntil: '',
      lockStatus: MetadataLockStatus.Unlocked,
    } as IAddMetadataForm,
    resolver: yupResolver(validationSchema),
  });

  const watchedKeyType = watch('keyType');
  const watchedValue = watch('value');
  const watchedGlobalKeyId = watch('globalKeyId');
  const watchedLockStatus = watch('lockStatus');

  // Type-safe error access for discriminated union
  const errors = formErrors as Partial<
    Record<keyof AllFormFields, { message?: string }>
  >;

  // Reset form fields when switching between local and global
  useEffect(() => {
    // Reset local fields
    setValue('localKeyName', '');
    setValue('localKeyDescription', '');
    setValue('localKeyTypeDef', '');
    setValue('localKeyUrl', '');
    // Reset global fields
    setValue('globalKeyId', '');
    // Also reset value-related fields
    setValue('value', '');
    setValue('expiry', '');
    setValue('lockedUntil', '');
    setValue('lockStatus', MetadataLockStatus.Unlocked);
  }, [watchedKeyType, setValue]);

  // Clear locked until date when lock status changes
  useEffect(() => {
    setValue('lockedUntil', '');
  }, [watchedLockStatus, setValue]);

  const selectedGlobalKey = useMemo(() => {
    if (watchedKeyType === 'global' && watchedGlobalKeyId) {
      return globalMetadata.find(
        (key) => key.id.toString() === watchedGlobalKeyId,
      );
    }
    return undefined;
  }, [watchedKeyType, watchedGlobalKeyId, globalMetadata]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (formData: IAddMetadataForm) => {
      try {
        const trimmedValue = formData.value?.trim();

        const details = trimmedValue
          ? ({
              lockStatus: formData.lockStatus,
              lockedUntil: formData.lockedUntil
                ? new Date(formData.lockedUntil)
                : undefined,
              expiry: formData.expiry ? new Date(formData.expiry) : undefined,
            } as MetadataValueDetails)
          : undefined;
        if (formData.keyType === 'global') {
          if (!trimmedValue) {
            throw new Error('Value is required for global metadata');
          }

          await onSetMetadata({
            id: new BigNumber(formData.globalKeyId),
            type: MetadataType.Global,
            params: {
              value: trimmedValue,
              details,
            },
            onTransactionRunning: handleClose,
          });
        } else {
          // Create new local metadata key
          const trimmedDescription = formData.localKeyDescription?.trim();
          const trimmedTypeDef = formData.localKeyTypeDef?.trim();
          const trimmedUrl = formData.localKeyUrl?.trim();

          await onRegisterMetadata({
            name: formData.localKeyName.trim(),
            specs: {
              description: trimmedDescription,
              typeDef: trimmedTypeDef,
              url: trimmedUrl,
            },
            value: trimmedValue,
            details,
            onTransactionRunning: handleClose,
          } as RegisterMetadataParams & {
            onTransactionRunning?: () => void | Promise<void>;
          });
        }
      } catch (error) {
        notifyError((error as Error).message);
      }
    },
    [onSetMetadata, onRegisterMetadata, handleClose],
  );

  const lockStatusOptions = useMemo(
    () => [
      { value: MetadataLockStatus.Unlocked, label: 'Not Locked' },
      { value: MetadataLockStatus.Locked, label: 'Locked Permanently' },
      { value: MetadataLockStatus.LockedUntil, label: 'Locked Until Date' },
    ],
    [],
  );

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="700px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Add Asset Metadata
          </Heading>
          <DescriptionText>
            Attach structured information to your asset using metadata. Choose
            from standardized global keys defined by Polymesh governance, or
            create custom local keys specific to your asset. For details, visit
            the{' '}
            <StyledLink
              href="https://developers.polymesh.network/core/assets/metadata/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Metadata Documentation
            </StyledLink>
            .
          </DescriptionText>
          <DescriptionText>
            Values can be defined now when creating the key, or set later.
          </DescriptionText>

          <HeaderRow>
            <FieldLabel>Key Definition:</FieldLabel>
          </HeaderRow>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldWrapper>
              <FieldRow>
                <FieldLabel htmlFor="keyType">Metadata Key Type</FieldLabel>
                <FieldSelect
                  id="keyType"
                  {...register('keyType')}
                  $hasError={!!errors.keyType}
                >
                  <option value="local">Local (Custom Key)</option>
                  <option value="global">Global (Polymesh Defined)</option>
                </FieldSelect>
              </FieldRow>
              {errors.keyType && (
                <StyledErrorMessage>
                  {errors.keyType.message}
                </StyledErrorMessage>
              )}
            </FieldWrapper>

            {watchedKeyType === 'global' ? (
              <>
                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel htmlFor="globalKeyId">
                      Global Metadata Key
                    </FieldLabel>
                    <FieldSelect
                      id="globalKeyId"
                      {...register('globalKeyId')}
                      $hasError={!!errors.globalKeyId}
                    >
                      <option value="">Select a global key...</option>
                      {globalMetadata.map((key) => (
                        <option
                          key={key.id.toString()}
                          value={key.id.toString()}
                        >
                          {key.name}
                        </option>
                      ))}
                    </FieldSelect>
                  </FieldRow>

                  {errors.globalKeyId && (
                    <StyledErrorMessage>
                      {errors.globalKeyId.message}
                    </StyledErrorMessage>
                  )}
                </FieldWrapper>

                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel htmlFor="globalKeyDescription">
                      Description
                    </FieldLabel>
                    <FieldTextarea
                      id="globalKeyDescription"
                      readOnly
                      value={selectedGlobalKey?.specs.description || ''}
                      rows={3}
                    />
                  </FieldRow>
                </FieldWrapper>
                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel htmlFor="globalKeyTypeDef">
                      Type Definition
                    </FieldLabel>
                    <FieldInput
                      type="text"
                      id="globalKeyTypeDef"
                      readOnly
                      value={selectedGlobalKey?.specs.typeDef || ''}
                    />
                  </FieldRow>
                </FieldWrapper>
                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel htmlFor="globalKeyUrl">
                      Reference URL
                    </FieldLabel>
                    <FieldInput
                      type="text"
                      id="globalKeyUrl"
                      readOnly
                      value={selectedGlobalKey?.specs.url || ''}
                    />
                  </FieldRow>
                </FieldWrapper>
              </>
            ) : (
              <>
                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel htmlFor="localKeyName">
                      Metadata Key Name
                    </FieldLabel>
                    <FieldInput
                      type="text"
                      id="localKeyName"
                      placeholder="e.g., Certificate Number"
                      {...register('localKeyName')}
                      $hasError={!!errors.localKeyName}
                    />
                  </FieldRow>

                  {errors.localKeyName && (
                    <StyledErrorMessage>
                      {errors.localKeyName.message}
                    </StyledErrorMessage>
                  )}
                </FieldWrapper>

                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel htmlFor="localKeyDescription">
                      Description
                    </FieldLabel>
                    <FieldTextarea
                      id="localKeyDescription"
                      placeholder="Optional description of this metadata"
                      rows={3}
                      {...register('localKeyDescription')}
                    />
                  </FieldRow>
                  {errors.localKeyDescription && (
                    <StyledErrorMessage>
                      {errors.localKeyDescription.message}
                    </StyledErrorMessage>
                  )}
                </FieldWrapper>

                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel htmlFor="localKeyTypeDef">
                      Type Definition
                    </FieldLabel>
                    <FieldInput
                      type="text"
                      id="localKeyTypeDef"
                      placeholder="e.g., String, Number, JSON schema (optional)"
                      {...register('localKeyTypeDef')}
                      $hasError={!!errors.localKeyTypeDef}
                    />
                  </FieldRow>

                  {errors.localKeyTypeDef && (
                    <StyledErrorMessage>
                      {errors.localKeyTypeDef.message}
                    </StyledErrorMessage>
                  )}
                </FieldWrapper>

                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel htmlFor="localKeyUrl">Reference URL</FieldLabel>
                    <FieldInput
                      type="text"
                      id="localKeyUrl"
                      placeholder="https://example.com/spec"
                      {...register('localKeyUrl')}
                      $hasError={!!errors.localKeyUrl}
                    />
                  </FieldRow>

                  {errors.localKeyUrl && (
                    <StyledErrorMessage>
                      {errors.localKeyUrl.message}
                    </StyledErrorMessage>
                  )}
                </FieldWrapper>
              </>
            )}

            <HeaderRow>
              <FieldLabel>Value Definition:</FieldLabel>
            </HeaderRow>

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

            {watchedLockStatus === MetadataLockStatus.LockedUntil && (
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
                {transactionInProcess ? 'Adding...' : 'Add Metadata'}
              </Button>
            </ModalActions>
          </form>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
