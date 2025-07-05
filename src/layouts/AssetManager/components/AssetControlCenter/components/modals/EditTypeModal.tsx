/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useCallback,
  useMemo,
  useEffect,
  useState,
  useContext,
} from 'react';
import { useForm } from 'react-hook-form';
import { KnownAssetType } from '@polymeshassociation/polymesh-sdk/types';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { IAssetDetails } from '~/context/AssetContext/constants';
import { splitCamelCase } from '~/helpers/formatters';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { notifyError } from '~/helpers/notifications';

import { ModalContainer, ModalContent, ModalActions } from '../../styles';
import {
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldWrapper,
  StyledErrorMessage,
} from '../../../CreateAssetWizard/styles';
import { PolymeshContext } from '~/context/PolymeshContext';

interface IEditTypeForm {
  assetType: string;
  customAssetType: string;
  customAssetTypeId: string;
}

interface IEditTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: IAssetDetails;
  onModifyAssetType: (
    assetType: KnownAssetType | string,
    onTransactionRunning?: () => void | Promise<void>,
  ) => Promise<void>;
  transactionInProcess: boolean;
}

export const EditTypeModal: React.FC<IEditTypeModalProps> = ({
  isOpen,
  onClose,
  asset,
  onModifyAssetType,
  transactionInProcess,
}) => {
  const {
    api: { sdk, polkadotApi },
  } = useContext(PolymeshContext);
  const { executeTransaction } = useTransactionStatusContext();
  const [pendingCustomAssetType, setPendingCustomAssetType] =
    useState<string>('');
  const [customTypeExists, setCustomTypeExists] = useState(true);
  const [showCreateButton, setShowCreateButton] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  // Memoized current asset type information
  const currentAssetTypeInfo = useMemo(() => {
    const currentAssetType = asset.details?.assetType || '';
    const isCustomType = !Object.values(KnownAssetType).includes(
      currentAssetType as KnownAssetType,
    );
    return {
      value: currentAssetType,
      isCustom: isCustomType,
      displayValue: isCustomType ? 'Custom' : currentAssetType,
      customValue: isCustomType ? currentAssetType : '',
    };
  }, [asset.details?.assetType]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
    clearErrors,
    setError,
  } = useForm<IEditTypeForm>({
    mode: 'onChange',
    defaultValues: {
      assetType: currentAssetTypeInfo.displayValue,
      customAssetType: currentAssetTypeInfo.customValue,
      customAssetTypeId: '',
    },
  });

  const watchedAssetType = watch('assetType');
  const watchedCustomAssetType = watch('customAssetType');

  const assetTypes = useMemo(
    () => [...(Object.values(KnownAssetType) as KnownAssetType[]), 'Custom'],
    [],
  );

  // Helper function to reset custom type state
  const resetCustomTypeState = useCallback(() => {
    setCustomTypeExists(true);
    setShowCreateButton(false);
    setPendingCustomAssetType('');
    setIsResolving(false);
    clearErrors(['customAssetTypeId']);
  }, [clearErrors]);

  const handleAssetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setValue('assetType', value, { shouldValidate: true });
    if (value !== 'Custom') {
      setValue('customAssetType', '', { shouldValidate: true });
      setValue('customAssetTypeId', '', { shouldValidate: true });
      resetCustomTypeState();
    } else {
      // When switching to Custom, clear any existing errors for the custom fields
      clearErrors(['customAssetType', 'customAssetTypeId']);
    }
  };

  const handleClose = useCallback(() => {
    reset();
    resetCustomTypeState();
    onClose();
  }, [reset, onClose, resetCustomTypeState]);

  const onSubmit = useCallback(
    async (formData: IEditTypeForm) => {
      const finalAssetType =
        formData.assetType === 'Custom'
          ? formData.customAssetType.trim()
          : formData.assetType;

      await onModifyAssetType(finalAssetType, handleClose);
    },
    [onModifyAssetType, handleClose],
  );

  const isFormValid = useMemo(() => {
    // Don't allow submission while resolving type information
    if (isResolving) return false;

    // Check basic validation first
    const hasValidInput =
      watchedAssetType === 'Custom'
        ? !errors.customAssetType &&
          !errors.customAssetTypeId &&
          watchedCustomAssetType.trim() &&
          watch('customAssetTypeId').trim() &&
          customTypeExists
        : !errors.assetType && watchedAssetType;

    if (!hasValidInput) return false;

    // Check if values have actually changed
    const finalAssetType =
      watchedAssetType === 'Custom'
        ? watchedCustomAssetType.trim()
        : watchedAssetType;

    const hasChanged = finalAssetType !== currentAssetTypeInfo.value;

    return hasChanged;
  }, [
    watchedAssetType,
    watchedCustomAssetType,
    errors.assetType,
    errors.customAssetType,
    errors.customAssetTypeId,
    customTypeExists,
    currentAssetTypeInfo.value,
    isResolving,
    watch,
  ]);

  // Update form values when modal opens or asset changes
  useEffect(() => {
    if (isOpen) {
      reset({
        assetType: currentAssetTypeInfo.displayValue,
        customAssetType: currentAssetTypeInfo.customValue,
        customAssetTypeId: '',
      });
      resetCustomTypeState();
    }
  }, [
    isOpen,
    currentAssetTypeInfo.displayValue,
    currentAssetTypeInfo.customValue,
    reset,
    resetCustomTypeState,
  ]);

  // Helper function to handle early returns for resolve functions
  const handleResolveEarlyReturn = useCallback(() => {
    resetCustomTypeState();
  }, [resetCustomTypeState]);

  // Function to check if a numeric ID corresponds to an existing custom type
  const resolveCustomTypeFromId = useCallback(
    async (input: string) => {
      if (!polkadotApi || !input.trim()) {
        handleResolveEarlyReturn();
        return;
      }

      const trimmedInput = input.trim();
      const numericId = Number(trimmedInput);
      if (!Number.isInteger(numericId) || numericId < 0) {
        handleResolveEarlyReturn();
        return;
      }

      setIsResolving(true);
      try {
        const customTypeData =
          await polkadotApi.query.asset.customTypes(numericId);

        if (customTypeData && customTypeData.length > 0) {
          const typeName = customTypeData.toUtf8();
          setValue('customAssetType', typeName, { shouldValidate: true });
          setCustomTypeExists(true);
          setShowCreateButton(false);
        } else {
          // ID doesn't exist, clear the name field and show error
          setValue('customAssetType', '', { shouldValidate: true });
          setCustomTypeExists(false);
          setShowCreateButton(false);
          setPendingCustomAssetType('');
          setError('customAssetTypeId', {
            message: `Custom asset type with ID ${numericId} does not exist`,
          });
        }
      } catch (error) {
        setCustomTypeExists(true);
        setShowCreateButton(false);
        setError('customAssetTypeId', {
          message: 'Failed to validate custom type ID',
        });
      } finally {
        setIsResolving(false);
      }
    },
    [polkadotApi, setValue, handleResolveEarlyReturn, setError],
  );

  // Function to check if a name corresponds to an existing custom type and get its ID
  const resolveCustomTypeFromName = useCallback(
    async (input: string) => {
      if (!polkadotApi || !input.trim()) {
        handleResolveEarlyReturn();
        return;
      }

      const trimmedInput = input.trim();

      setIsResolving(true);
      try {
        const rawId =
          await polkadotApi.query.asset.customTypesInverse(trimmedInput);

        if (rawId.isSome) {
          const typeId = rawId.unwrap().toString();
          setValue('customAssetTypeId', typeId, { shouldValidate: true });
          setCustomTypeExists(true);
          setShowCreateButton(false);
        } else {
          // Clear the ID field if name doesn't exist
          setValue('customAssetTypeId', '', { shouldValidate: true });
          setCustomTypeExists(false);
          setShowCreateButton(true);
          setPendingCustomAssetType(trimmedInput);
        }
      } catch (error) {
        setCustomTypeExists(true);
        setShowCreateButton(false);
      } finally {
        setIsResolving(false);
      }
    },
    [polkadotApi, setValue, handleResolveEarlyReturn],
  );

  // Handle custom asset type name input blur
  const handleCustomAssetTypeBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsResolving(true);
      resolveCustomTypeFromName(e.target.value);
    },
    [resolveCustomTypeFromName],
  );

  // Helper function to validate that either name OR ID is provided
  const validateEitherFieldProvided = useCallback(
    (currentValue: string, fieldName: 'name' | 'id') => {
      if (watchedAssetType !== 'Custom') return true;

      const hasCurrentValue = currentValue && currentValue.trim();
      const hasOtherValue =
        fieldName === 'name'
          ? watch('customAssetTypeId') && watch('customAssetTypeId').trim()
          : watch('customAssetType') && watch('customAssetType').trim();

      if (!hasCurrentValue && !hasOtherValue) {
        return 'Please enter either a custom type name or ID';
      }
      return true;
    },
    [watchedAssetType, watch],
  );
  const clearOtherField = useCallback(
    (fieldToClear: 'customAssetType' | 'customAssetTypeId') => {
      setValue(fieldToClear, '', { shouldValidate: true });
      setCustomTypeExists(false);
      setShowCreateButton(false);
      setPendingCustomAssetType('');
    },
    [setValue],
  );

  // Handle custom asset type name input change - clear ID immediately
  const handleCustomAssetTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setValue('customAssetType', value, { shouldValidate: true });
      clearOtherField('customAssetTypeId');
    },
    [setValue, clearOtherField],
  );

  // Handle custom asset type ID input blur
  const handleCustomAssetTypeIdBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsResolving(true);
      resolveCustomTypeFromId(e.target.value);
    },
    [resolveCustomTypeFromId],
  );

  // Handle custom asset type ID input change - clear name immediately
  const handleCustomAssetTypeIdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setValue('customAssetTypeId', value, { shouldValidate: true });
      clearOtherField('customAssetType');
    },
    [setValue, clearOtherField],
  );

  // Handle key down for custom asset type name input
  const handleCustomAssetTypeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setIsResolving(true);
        resolveCustomTypeFromName(e.currentTarget.value);
      }
    },
    [resolveCustomTypeFromName],
  );

  // Handle key down for custom asset type ID input
  const handleCustomAssetTypeIdKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setIsResolving(true);
        resolveCustomTypeFromId(e.currentTarget.value);
      }
    },
    [resolveCustomTypeFromId],
  );

  // Handle creating a custom type directly
  const handleCreateCustomType = useCallback(async () => {
    if (!pendingCustomAssetType || !sdk) {
      notifyError('Invalid input or SDK not available');
      return;
    }

    try {
      await executeTransaction(
        sdk.assets.registerCustomAssetType({ name: pendingCustomAssetType }),
        {
          onSuccess: async () => {
            // After creation, resolve the ID for the name
            await resolveCustomTypeFromName(pendingCustomAssetType);
            setShowCreateButton(false);
            setCustomTypeExists(true);
            setPendingCustomAssetType('');
          },
        },
      );
    } catch (error) {
      notifyError(
        `Failed to create custom asset type: ${(error as Error).message}`,
      );
    }
  }, [
    pendingCustomAssetType,
    sdk,
    executeTransaction,
    resolveCustomTypeFromName,
  ]);

  // Resolve custom type ID when modal opens with a custom type
  useEffect(() => {
    if (
      isOpen &&
      currentAssetTypeInfo.isCustom &&
      currentAssetTypeInfo.customValue
    ) {
      resolveCustomTypeFromName(currentAssetTypeInfo.customValue);
    }
  }, [
    isOpen,
    currentAssetTypeInfo.isCustom,
    currentAssetTypeInfo.customValue,
    resolveCustomTypeFromName,
  ]);

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Modify Asset Type
          </Heading>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Asset Type</FieldLabel>
              <FieldSelect
                value={watchedAssetType}
                disabled={transactionInProcess}
                {...register('assetType', {
                  required: 'Asset type is required',
                  onChange: handleAssetTypeChange,
                })}
              >
                {assetTypes.map((type) => (
                  <option key={type} value={type}>
                    {splitCamelCase(type)}
                  </option>
                ))}
              </FieldSelect>
            </FieldRow>

            {errors.assetType && (
              <StyledErrorMessage>
                {errors.assetType.message}
              </StyledErrorMessage>
            )}
          </FieldWrapper>

          {watchedAssetType === 'Custom' && (
            <>
              <FieldWrapper>
                <Text marginBottom={16} color="secondary">
                  Enter the Custom Type Name <strong>OR</strong> Type ID.
                </Text>
                <FieldRow>
                  <FieldLabel>Custom Type Name</FieldLabel>
                  <FieldInput
                    type="text"
                    placeholder="Enter custom type name"
                    $hasError={!!errors.customAssetType}
                    disabled={transactionInProcess}
                    onKeyDown={handleCustomAssetTypeKeyDown}
                    {...register('customAssetType', {
                      maxLength: {
                        value: 64,
                        message: 'Custom type must be 64 characters or less',
                      },
                      validate: (value) =>
                        validateEitherFieldProvided(value, 'name'),
                      onChange: handleCustomAssetTypeChange,
                      onBlur: handleCustomAssetTypeBlur,
                    })}
                  />
                </FieldRow>

                {errors.customAssetType && (
                  <StyledErrorMessage>
                    {errors.customAssetType.message}
                  </StyledErrorMessage>
                )}
              </FieldWrapper>

              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Custom Type ID</FieldLabel>
                  <FieldInput
                    type="text"
                    placeholder="Enter custom type ID"
                    $hasError={!!errors.customAssetTypeId}
                    disabled={transactionInProcess}
                    onKeyDown={handleCustomAssetTypeIdKeyDown}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      // Only allow digits, removing any non-digit characters
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/[^0-9]/g, '');
                    }}
                    {...register('customAssetTypeId', {
                      validate: (value) => {
                        // Only check if either name OR ID is provided - no API calls here
                        return validateEitherFieldProvided(value, 'id');
                      },
                      onChange: handleCustomAssetTypeIdChange,
                      onBlur: handleCustomAssetTypeIdBlur,
                    })}
                  />
                </FieldRow>

                {errors.customAssetTypeId && (
                  <StyledErrorMessage>
                    {errors.customAssetTypeId.message}
                  </StyledErrorMessage>
                )}
              </FieldWrapper>

              {showCreateButton && !errors.customAssetType && (
                <FieldWrapper>
                  <Text marginBottom={16} color="secondary">
                    Custom asset type <strong>{pendingCustomAssetType}</strong>{' '}
                    does not exist yet.
                  </Text>

                  <Button
                    variant="modalPrimary"
                    onClick={handleCreateCustomType}
                    disabled={transactionInProcess}
                  >
                    Create New Custom Type
                  </Button>
                </FieldWrapper>
              )}
            </>
          )}

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
              disabled={!isFormValid || transactionInProcess || isResolving}
            >
              Update Type
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
