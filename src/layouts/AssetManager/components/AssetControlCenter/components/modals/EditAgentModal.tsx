/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import {
  AgentWithGroup,
  CustomPermissionGroup,
  Identity,
  KnownPermissionGroup,
  PermissionGroups,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { CopyToClipboard, Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { formatDid } from '~/helpers/formatters';

import {
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldWrapper,
  StyledErrorMessage,
} from '../../../CreateAssetWizard/styles';
import {
  DetailValue,
  ModalActions,
  ModalContainer,
  ModalContent,
} from '../../styles';

interface IEditAgentForm {
  permissionGroup: string;
  customGroupId?: string;
}

interface IEditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentWithGroup: AgentWithGroup | null;
  permissionGroups: PermissionGroups | undefined;
  onEditAgent: (params: {
    agent: Identity;
    group: KnownPermissionGroup | CustomPermissionGroup;
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

// Validation schema for editing agent
const createEditAgentSchema = (customGroups: CustomPermissionGroup[]) =>
  yup.object({
    permissionGroup: yup.string().required('Permission group is required'),
    customGroupId: yup.string().when('permissionGroup', {
      is: 'Custom',
      then: (schema) =>
        customGroups.length > 0
          ? schema.required('Custom group ID is required')
          : schema.optional(),
      otherwise: (schema) => schema.optional(),
    }),
  });

export const EditAgentModal: React.FC<IEditAgentModalProps> = ({
  isOpen,
  onClose,
  agentWithGroup,
  permissionGroups,
  onEditAgent,
  transactionInProcess,
}) => {
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
  } = useForm<IEditAgentForm>({
    mode: 'onChange',
    defaultValues: {
      permissionGroup: '',
      customGroupId: '',
    },
    resolver: yupResolver(createEditAgentSchema(customGroups)),
  });

  const watchedPermissionGroup = watch('permissionGroup');

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Initialize form with current group when modal opens
  useEffect(() => {
    if (isOpen && agentWithGroup) {
      const currentGroup = agentWithGroup.group;

      if ('id' in currentGroup) {
        // It's a custom group
        reset({
          permissionGroup: 'Custom',
          customGroupId: currentGroup.id.toString(),
        });
      } else if ('type' in currentGroup) {
        // It's a known group
        reset({
          permissionGroup: currentGroup.type,
          customGroupId: '',
        });
      }
    }
  }, [isOpen, agentWithGroup, reset]);

  const onSubmit = useCallback(
    async (formData: IEditAgentForm) => {
      if (!agentWithGroup) return;

      let group: KnownPermissionGroup | CustomPermissionGroup;

      if (formData.permissionGroup === 'Custom') {
        if (!formData.customGroupId) return;
        // Find the custom group entity by ID
        const selectedCustomGroup = customGroups.find(
          (customGroup) => customGroup.id.toString() === formData.customGroupId,
        );
        if (!selectedCustomGroup) {
          throw new Error('Custom group entity not found');
        }
        group = selectedCustomGroup;
      } else {
        // Find the known group entity by type
        const knownGroup = knownGroups.find(
          (groupEntity) => groupEntity.type === formData.permissionGroup,
        );
        if (!knownGroup) {
          throw new Error('Known permission group not found');
        }
        group = knownGroup;
      }

      const params = {
        agent: agentWithGroup.agent,
        group,
        onTransactionRunning: handleClose,
      };

      await onEditAgent(params);
    },
    [agentWithGroup, customGroups, knownGroups, onEditAgent, handleClose],
  );

  const isFormValid =
    !errors.permissionGroup &&
    !errors.customGroupId &&
    watchedPermissionGroup &&
    agentWithGroup &&
    // If Custom is selected, ensure there are custom groups available and one is selected
    (watchedPermissionGroup !== 'Custom' ||
      (customGroups.length > 0 && watch('customGroupId')));

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Edit Agent Permissions
          </Heading>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Agent DID</FieldLabel>
              <DetailValue>
                {formatDid(agentWithGroup?.agent.did || '', 8, 8)}
                <CopyToClipboard value={agentWithGroup?.agent.did || ''} />
              </DetailValue>
            </FieldRow>
          </FieldWrapper>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Permissions Group</FieldLabel>
              <FieldSelect
                $hasError={!!errors.permissionGroup}
                disabled={transactionInProcess}
                {...register('permissionGroup')}
              >
                <option value="Custom">Custom Group</option>

                {knownGroups.map((group) => {
                  let displayName: string = group.type;
                  if (group.type === 'Full') {
                    displayName = 'Full Permissions';
                  } else if (group.type === 'PolymeshV1Pia') {
                    displayName = 'Primary Issuance Agent';
                  }
                  return (
                    <option key={group.type} value={group.type}>
                      {displayName}
                    </option>
                  );
                })}
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
                          value={group.id.toNumber().toString()}
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
              Update Permissions
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
