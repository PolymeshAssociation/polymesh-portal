/* eslint-disable react/jsx-props-no-spreading */
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  ConditionTarget,
  ConditionType,
  InputCondition,
  Requirement,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { notifyError } from '~/helpers/notifications';
import ComplianceRule from '../../../CreateAssetWizard/components/ComplianceRule';
import {
  DescriptionText,
  StyledForm,
  StyledLink,
} from '../../../CreateAssetWizard/styles';
import {
  ComplianceRuleFormData,
  FormComplianceRule,
} from '../../../CreateAssetWizard/types';
import {
  convertFormRulesToSdk,
  convertSdkToFormFormat,
} from '../../../CreateAssetWizard/utils/complianceConverters';
import { ModalActions, ModalContainer, ModalContent } from '../../styles';

interface IEditComplianceRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  ruleToEdit: Requirement | null;
  onEditRule: (params: {
    id: BigNumber;
    conditions: InputCondition[];
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

const DEFAULT_NEW_RULE: FormComplianceRule = {
  conditions: [
    {
      type: ConditionType.IsPresent,
      target: ConditionTarget.Both,
      claims: [],
    },
  ],
};

export const EditComplianceRuleModal: React.FC<
  IEditComplianceRuleModalProps
> = ({
  isOpen,
  onClose,
  assetId,
  ruleToEdit,
  onEditRule,
  transactionInProcess,
}) => {
  const [activeConditionIndex, setActiveConditionIndex] = useState<
    number | null
  >(null);

  const { control, handleSubmit, setValue, reset } =
    useForm<ComplianceRuleFormData>({
      defaultValues: {
        complianceRules: [DEFAULT_NEW_RULE],
      },
    });

  const { fields: ruleFields } = useFieldArray({
    control,
    name: 'complianceRules',
  });

  // Load the rule to edit when modal opens
  useEffect(() => {
    if (isOpen && ruleToEdit) {
      try {
        // Convert SDK rule to form format
        const formRules = convertSdkToFormFormat({
          requirements: [ruleToEdit.conditions],
        });

        reset({
          complianceRules: formRules,
        });
      } catch (error) {
        notifyError(`Failed to load rule: ${(error as Error).message}`);
      }
    }
  }, [isOpen, ruleToEdit, reset]);

  const handleClose = useCallback(() => {
    reset({ complianceRules: [DEFAULT_NEW_RULE] });
    setActiveConditionIndex(null);
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (data: ComplianceRuleFormData) => {
      // Check if there's an active condition that hasn't been finalized
      if (activeConditionIndex !== null) {
        notifyError(
          'Please finalize the current condition before submitting the rule',
        );
        return;
      }

      // Validate that at least one condition exists
      if (!data.complianceRules[0]?.conditions?.length) {
        notifyError('A rule must have at least one condition');
        return;
      }

      try {
        if (!ruleToEdit) {
          notifyError('No rule selected for editing');
          return;
        }

        const sdkRules = convertFormRulesToSdk(data.complianceRules);

        // Since we're editing a single rule, get the first (and only) rule's conditions
        const conditions = sdkRules[0];

        await onEditRule({
          id: ruleToEdit.id,
          conditions,
          onTransactionRunning: handleClose,
        });
      } catch (error) {
        notifyError(
          `Failed to edit compliance rule: ${(error as Error).message}`,
        );
      }
    },
    [onEditRule, handleClose, activeConditionIndex, ruleToEdit],
  );

  if (!isOpen || !ruleToEdit) return null;

  return (
    <Modal handleClose={handleClose} customWidth="700px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Edit Compliance Rule ID: {ruleToEdit.id.toString()}
          </Heading>
          <DescriptionText>
            Compliance rules are automatically enforced on-chain for every asset
            transfer. For a transfer to proceed, at least one rule must be fully
            satisfied. Within a rule,{' '}
            <strong>all conditions must be met</strong> for that rule to be
            considered satisfied. For more information, visit the{' '}
            <StyledLink
              href="https://developers.polymesh.network/compliance/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Polymesh Compliance Documentation
            </StyledLink>
            .
          </DescriptionText>

          <StyledForm onSubmit={handleSubmit(onSubmit)}>
            {ruleFields.map((rule, ruleIdx) => (
              <ComplianceRule
                key={rule.id}
                control={control}
                setValue={setValue}
                baseName={`complianceRules.${ruleIdx}.conditions`}
                nextAssetId={assetId}
                isActive
                activeConditionIndex={activeConditionIndex}
                setActiveConditionIndex={setActiveConditionIndex}
              />
            ))}
          </StyledForm>

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
              disabled={transactionInProcess}
            >
              {transactionInProcess ? 'Processing...' : 'Submit Changes'}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
