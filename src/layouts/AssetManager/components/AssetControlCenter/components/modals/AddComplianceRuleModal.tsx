/* eslint-disable react/jsx-props-no-spreading */
import {
  ConditionTarget,
  ConditionType,
  InputCondition,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useState } from 'react';
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
import { convertFormRulesToSdk } from '../../../CreateAssetWizard/utils/complianceConverters';
import { ModalActions, ModalContainer, ModalContent } from '../../styles';

interface IAddComplianceRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  onAddRule: (params: {
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

export const AddComplianceRuleModal: React.FC<IAddComplianceRuleModalProps> = ({
  isOpen,
  onClose,
  assetId,
  onAddRule,
  transactionInProcess,
}) => {
  const [activeConditionIndex, setActiveConditionIndex] = useState<
    number | null
  >(0);

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

  const handleClose = useCallback(() => {
    reset({ complianceRules: [DEFAULT_NEW_RULE] });
    setActiveConditionIndex(0);
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
        const sdkRules = convertFormRulesToSdk(data.complianceRules);
        // Since we're adding a single rule, get the first (and only) rule's conditions
        const conditions = sdkRules[0];

        await onAddRule({
          conditions,
          onTransactionRunning: handleClose,
        });
      } catch (error) {
        notifyError(
          `Failed to add compliance rule: ${(error as Error).message}`,
        );
      }
    },
    [onAddRule, handleClose, activeConditionIndex],
  );

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="700px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Add Compliance Rule
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
            {ruleFields.map((rule, ruleIndex) => (
              <ComplianceRule
                key={rule.id}
                control={control}
                setValue={setValue}
                baseName={`complianceRules.${ruleIndex}.conditions`}
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
              {transactionInProcess ? 'Processing...' : 'Submit Rule'}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
