/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  CustomPermissionGroup,
  KnownPermissionGroup,
  PermissionGroups,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import {
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldWrapper,
  StyledErrorMessage,
} from '../../../CreateAssetWizard/styles';
import { ModalActions, ModalContainer, ModalContent } from '../../styles';
import { getPermissionGroupName, resolvePermissionGroup } from './helpers';

interface IAddAgentForm {
  targetDid: string;
  permissionGroup: string;
  customGroupId?: string;
  expiry?: string;
}

interface IAddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissionGroups: PermissionGroups | undefined;
  onAddAgent: (params: {
    target: string;
    permissions: KnownPermissionGroup | CustomPermissionGroup;
    expiry?: Date;
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

// Validation schema for adding agent
const createAddAgentSchema = (
  customGroups: CustomPermissionGroup[],
  sdk?: Polymesh | null,
) =>
  yup.object({
    targetDid: yup
      .string()
      .required('Target DID is required')
      .matches(
        /^0x[0-9a-fA-F]{64}$/,
        'DID must be a valid 64-character hex string',
      )
      .test(
        'is-valid-identity',
        'Identity does not exist',
        async function validateDid(value) {
          if (!value || !value.match(/^0x[0-9a-fA-F]{64}$/)) return true;
          if (!sdk) return false;
          try {
            const isValid = await sdk.identities.isIdentityValid({
              identity: value,
            });
            return isValid;
          } catch (error) {
            return false;
          }
        },
      ),
    permissionGroup: yup.string().required('Permission group is required'),
    customGroupId: yup.string().when('permissionGroup', {
      is: 'Custom',
      then: (schema) =>
        customGroups.length > 0
          ? schema.required('Custom group ID is required')
          : schema.optional(),
      otherwise: (schema) => schema.optional(),
    }),
    expiry: yup.string().optional(),
  });

export const AddAgentModal: React.FC<IAddAgentModalProps> = ({
  isOpen,
  onClose,
  permissionGroups,
  onAddAgent,
  transactionInProcess,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const knownGroups = useMemo(
    () => permissionGroups?.known || [],
    [permissionGroups?.known],
  );
  const customGroups = useMemo(
    () => permissionGroups?.custom || [],
    [permissionGroups?.custom],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<IAddAgentForm>({
    mode: 'onChange',
    defaultValues: {
      targetDid: '',
      permissionGroup: '',
      customGroupId: '',
      expiry: '',
    },
    resolver: yupResolver(createAddAgentSchema(customGroups, sdk)),
  });

  const watchedPermissionGroup = watch('permissionGroup');
  const watchedTargetDid = watch('targetDid');

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (formData: IAddAgentForm) => {
      const permissions = resolvePermissionGroup(
        formData.permissionGroup,
        formData.customGroupId,
        customGroups,
        knownGroups,
      );

      await onAddAgent({
        target: formData.targetDid.trim(),
        permissions,
        expiry: formData.expiry ? new Date(formData.expiry) : undefined,
        onTransactionRunning: handleClose,
      });
    },
    [customGroups, knownGroups, onAddAgent, handleClose],
  );

  const isFormValid =
    !errors.targetDid &&
    !errors.permissionGroup &&
    !errors.customGroupId &&
    watchedTargetDid.trim() &&
    watchedPermissionGroup &&
    // If Custom is selected, ensure there are custom groups available and one is selected
    (watchedPermissionGroup !== 'Custom' ||
      (customGroups.length > 0 && watch('customGroupId')));

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Add Asset Agent
          </Heading>
          <Text>
            This will create an authorization request to invite the specified
            identity to become an agent of this asset. The target identity must
            accept this authorization before they become an active agent with
            the selected permissions.
          </Text>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Target Identity (DID)</FieldLabel>
              <FieldInput
                type="text"
                placeholder="0x..."
                $hasError={!!errors.targetDid}
                disabled={transactionInProcess}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(onSubmit)();
                  }
                }}
                {...register('targetDid')}
              />
            </FieldRow>
            {errors.targetDid && (
              <StyledErrorMessage>
                {errors.targetDid.message}
              </StyledErrorMessage>
            )}
          </FieldWrapper>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Permission Group</FieldLabel>
              <FieldSelect
                $hasError={!!errors.permissionGroup}
                disabled={transactionInProcess}
                {...register('permissionGroup')}
              >
                <option value="">Select permission group</option>
                {knownGroups.map((group) => (
                  <option key={group.type} value={group.type}>
                    {getPermissionGroupName(group.type)}
                  </option>
                ))}
                <option value="Custom">Custom Group</option>
              </FieldSelect>
            </FieldRow>
            {errors.permissionGroup && (
              <StyledErrorMessage>
                {errors.permissionGroup.message}
              </StyledErrorMessage>
            )}
          </FieldWrapper>

          {watchedPermissionGroup === 'Custom' && (
            <FieldWrapper>
              <FieldRow>
                <FieldLabel>Select Custom Group</FieldLabel>
                <FieldSelect
                  $hasError={!!errors.customGroupId}
                  disabled={transactionInProcess || customGroups.length === 0}
                  {...register('customGroupId')}
                >
                  {customGroups.length > 0 ? (
                    <>
                      <option value="">Select custom group</option>
                      {customGroups.map((group) => (
                        <option
                          key={group.id.toNumber()}
                          value={group.id.toString()}
                        >
                          {`Custom Group ID: ${group.id.toNumber()}`}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="" disabled>
                      No custom groups available
                    </option>
                  )}
                </FieldSelect>
              </FieldRow>
              {errors.customGroupId && (
                <StyledErrorMessage>
                  {errors.customGroupId.message}
                </StyledErrorMessage>
              )}
              {customGroups.length === 0 && (
                <StyledErrorMessage>
                  No custom permission groups are available for this asset.
                </StyledErrorMessage>
              )}
            </FieldWrapper>
          )}

          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Expiry Date (Optional)</FieldLabel>
              <FieldInput
                type="datetime-local"
                $hasError={!!errors.expiry}
                disabled={transactionInProcess}
                {...register('expiry')}
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
              variant="modalPrimary"
              onClick={handleSubmit(onSubmit)}
              disabled={!isFormValid || transactionInProcess}
            >
              Send Invitation
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
