/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  ConditionTarget,
  ConditionType,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  FormContainer,
  DescriptionText,
  NavigationWrapper,
  IconWrapper,
  HeaderRow,
  FieldLabel,
  StyledForm,
  StyledFormSection,
  Button,
  StyledLink,
} from '../styles';
import { Icon } from '~/components';
import ComplianceRule from '../components/ComplianceRule';
import {
  WizardStepProps,
  FormComplianceRule,
  ComplianceRuleFormData,
} from '../types';
import StepNavigation from '../components/StepNavigation';
import { notifyError } from '~/helpers/notifications';
import {
  convertFormRulesToSdk,
  convertSdkToFormFormat,
} from '../utils/complianceConverters';

// Type definition for compliance rule component ref
interface ComplianceRuleRef {
  validateActiveCondition: () => Promise<boolean>;
}

// Constants for default rule configuration
const DEFAULT_NEW_RULE: FormComplianceRule = {
  conditions: [
    {
      type: ConditionType.IsPresent,
      target: ConditionTarget.Both,
      claims: [],
    },
  ],
};

const ComplianceRulesStep: React.FC<WizardStepProps> = ({
  onBack,
  onComplete,
  nextAssetId,
  defaultValues,
  isFinalStep,
  isLoading,
}) => {
  const [activeRuleIndex, setActiveRuleIndex] = useState<number | null>(null);
  const [activeConditionIndex, setActiveConditionIndex] = useState<
    number | null
  >(null);
  const [complianceRuleRefs, setComplianceRuleRefs] = useState<{
    [key: number]: React.RefObject<ComplianceRuleRef>;
  }>({});

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ComplianceRuleFormData>({
    defaultValues: {
      complianceRules: convertSdkToFormFormat(defaultValues.complianceRules),
    },
  });

  const {
    fields: ruleFields,
    append: appendRule,
    remove: removeRule,
  } = useFieldArray({
    control,
    name: 'complianceRules',
  });

  const rules = watch('complianceRules');

  // Create and manage refs for ComplianceRule components
  const getOrCreateRuleRef = (ruleIndex: number) => {
    if (!complianceRuleRefs[ruleIndex]) {
      setComplianceRuleRefs((prev) => ({
        ...prev,
        [ruleIndex]: React.createRef<ComplianceRuleRef>(),
      }));
    }
    return complianceRuleRefs[ruleIndex];
  };

  const validateActiveRule = async (): Promise<boolean> => {
    if (activeRuleIndex === null) return true;

    const rule = rules[activeRuleIndex];
    if (!rule?.conditions?.length) {
      notifyError('A rule must have at least one condition');
      return false;
    }

    // Validate the active condition in the active rule
    if (activeConditionIndex !== null) {
      const ruleRef = complianceRuleRefs[activeRuleIndex];
      if (ruleRef?.current) {
        try {
          const isConditionValid =
            await ruleRef.current.validateActiveCondition();
          if (!isConditionValid) {
            notifyError(
              'Please fix errors in the current condition before proceeding',
            );
            return false;
          }
        } catch (error) {
          notifyError('Validation error occurred');
          return false;
        }
      }
    }

    return true;
  };

  const handleEditRule = async (ruleIndex: number) => {
    const isValid = await validateActiveRule();
    if (!isValid) return;

    setActiveRuleIndex(ruleIndex);
    setActiveConditionIndex(null);
  };

  const handleFormSubmit = async (data: ComplianceRuleFormData) => {
    const isValid = await validateActiveRule();
    if (!isValid) return;

    try {
      const sdkRules = data.complianceRules.length
        ? convertFormRulesToSdk(data.complianceRules)
        : [];

      onComplete({
        ...defaultValues,
        complianceRules: { requirements: sdkRules },
      });
    } catch (error) {
      notifyError(
        `Failed to convert compliance rules: ${(error as Error).message}`,
      );
    }
  };

  // Helper function to handle adding a new rule
  const handleAddRule = async () => {
    const isValid = await validateActiveRule();
    if (!isValid) return;

    const newRuleIndex = ruleFields.length;
    appendRule(DEFAULT_NEW_RULE);
    setActiveRuleIndex(newRuleIndex);
    setActiveConditionIndex(0);
  };

  // Helper function to handle rule deletion with proper ref cleanup
  const handleDeleteRule = (ruleIndex: number) => {
    removeRule(ruleIndex);

    // Clean up and reindex refs after deletion
    setComplianceRuleRefs((prev) => {
      const newRefs: typeof prev = {};

      // Rebuild refs object with correct indices
      Object.entries(prev).forEach(([oldIndex, ref]) => {
        const oldIndexNum = parseInt(oldIndex, 10);
        if (oldIndexNum < ruleIndex) {
          // Rules before deleted rule keep same index
          newRefs[oldIndexNum] = ref;
        } else if (oldIndexNum > ruleIndex) {
          // Rules after deleted rule shift down by 1
          newRefs[oldIndexNum - 1] = ref;
        }
        // Skip the deleted rule's ref (oldIndexNum === ruleIndex)
      });

      return newRefs;
    });

    // Update active indices appropriately
    if (activeRuleIndex === ruleIndex) {
      setActiveRuleIndex(null);
      setActiveConditionIndex(null);
    } else if (activeRuleIndex !== null && activeRuleIndex > ruleIndex) {
      setActiveRuleIndex(activeRuleIndex - 1);
    }
  };

  // Helper function to handle back navigation
  const handleBackNavigation = async () => {
    const isValid = await validateActiveRule();
    if (isValid) {
      setActiveRuleIndex(null);
      setActiveConditionIndex(null);
      onBack();
    }
  };

  return (
    <FormContainer>
      <h2>Compliance Rules</h2>
      <DescriptionText>
        Define on-chain compliance rules for your asset that are automatically
        enforced. At least one rule must be fully met for an asset transfer to
        proceed. Each rule's conditions must all be satisfied for the rule to be
        considered met. Learn more at{' '}
        <StyledLink
          href="https://developers.polymesh.network/compliance/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Compliance Documentation
        </StyledLink>
        .
      </DescriptionText>

      <StyledForm onSubmit={handleSubmit(handleFormSubmit)}>
        {ruleFields.map((rule, ruleIndex) => (
          <StyledFormSection key={rule.id}>
            <HeaderRow>
              <FieldLabel>Rule #{ruleIndex + 1}</FieldLabel>
              <div>
                {activeRuleIndex !== ruleIndex && (
                  <IconWrapper onClick={() => handleEditRule(ruleIndex)}>
                    <Icon name="Edit" size="20px" />
                  </IconWrapper>
                )}
                <IconWrapper onClick={() => handleDeleteRule(ruleIndex)}>
                  <Icon name="Delete" size="20px" />
                </IconWrapper>
              </div>
            </HeaderRow>

            <ComplianceRule
              ref={getOrCreateRuleRef(ruleIndex)}
              control={control}
              setValue={setValue}
              baseName={`complianceRules.${ruleIndex}.conditions`}
              nextAssetId={nextAssetId}
              isActive={activeRuleIndex === ruleIndex}
              activeConditionIndex={activeConditionIndex}
              setActiveConditionIndex={setActiveConditionIndex}
            />
          </StyledFormSection>
        ))}

        <Button type="button" onClick={handleAddRule}>
          Add Rule
        </Button>
      </StyledForm>

      <NavigationWrapper>
        <StepNavigation
          onBack={handleBackNavigation}
          onNext={handleSubmit(handleFormSubmit)}
          isFinalStep={isFinalStep}
          disabled={Object.keys(errors).length > 0}
          isLoading={isLoading}
        />
      </NavigationWrapper>
    </FormContainer>
  );
};

export default ComplianceRulesStep;
