/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  useForm,
  useFieldArray,
  Control,
  UseFormSetValue,
} from 'react-hook-form';
import {
  ConditionTarget,
  ConditionType,
} from '@polymeshassociation/polymesh-sdk/types';
import * as yup from 'yup';
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
} from '../styles';
import { Icon } from '~/components';
import ComplianceRule from '../components/ComplianceRule';
import { WizardData, WizardStepProps } from '../types';
import StepNavigation from '../components/StepNavigation';

const validationSchema = yup.object().shape({
  complianceRules: yup
    .array()
    .of(
      yup.object().shape({
        conditions: yup
          .array()
          .of(
            yup.object().shape({
              target: yup.string().required('Target is required'),
              conditionType: yup
                .string()
                .required('Condition type is required'),
              claimType: yup.mixed().when('conditionType', {
                is: (type: string) => {
                  return type !== 'IsExternalAgent' && type !== 'IsIdentity';
                },
                then: (schema) => schema.required('Claim type is required'),
              }),
              identity: yup.mixed().when('conditionType', {
                is: ConditionType.IsIdentity,
                then: (schema) => schema.required('Identity is required'),
              }),
              scopeDetails: yup.string().required('Scope details are required'),
              countryCode: yup.string().when(['conditionType', 'claimType'], {
                is: (type: string, claim: string | string[]) =>
                  type !== 'IsExternalAgent' &&
                  type !== 'IsIdentity' &&
                  ((Array.isArray(claim) && claim.includes('Jurisdiction')) ||
                    claim === 'Jurisdiction'),
                then: (schema) => schema.required('Country code is required'),
              }),
              customClaimId: yup.string().when(['conditionType', 'claimType'], {
                is: (type: string, claim: string | string[]) =>
                  type !== 'IsExternalAgent' &&
                  type !== 'IsIdentity' &&
                  ((Array.isArray(claim) && claim.includes('Custom')) ||
                    claim === 'Custom'),
                then: (schema) =>
                  schema.required('Custom claim ID is required'),
              }),
            }),
          )
          .min(1, 'At least one condition is required'),
      }),
    )
    .min(1, 'At least one compliance rule is required'),
});

interface ComplianceRulesConstructorProps extends WizardStepProps {
  control: Control<any> & { setValue: UseFormSetValue<any> };
}

const ComplianceRulesConstructor: React.FC<WizardStepProps> = ({
  onBack,
  onComplete,
  nextAssetId,
  defaultValues,
  isFinalStep,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WizardData>({
    defaultValues,
    // resolver: yupResolver(validationSchema),
  });

  const {
    fields: ruleFields,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({ control, name: 'complianceRules' });

  const onSubmit = (data: WizardData) => {
    onComplete(data);
  };

  // Create an enhanced control object that includes setValue
  const enhancedControl = {
    ...control,
    setValue,
  };

  return (
    <FormContainer>
      <h2>Compliance Rules Constructor</h2>
      <DescriptionText>
        Define on-chain compliance rules that are automatically enforced. At
        least one rule must be fully met for an asset transfer to proceed. Each
        rule's conditions must all be satisfied for the rule to be considered
        met.
      </DescriptionText>

      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        {ruleFields.map((rule, ruleIndex) => (
          <StyledFormSection key={rule.id}>
            <HeaderRow>
              <FieldLabel>Rule #{ruleIndex + 1}</FieldLabel>
              <IconWrapper onClick={() => removeGroup(ruleIndex)}>
                <Icon name="Delete" size="20px" />
              </IconWrapper>
            </HeaderRow>

            <ComplianceRule
              control={enhancedControl}
              baseName={`complianceRules.${ruleIndex}.conditions`}
              nextAssetId={nextAssetId}
            />
          </StyledFormSection>
        ))}

        <Button
          type="button"
          onClick={() =>
            appendGroup({
              conditions: [
                {
                  type: ConditionType.IsExternalAgent,
                  target: ConditionTarget.Both,
                },
              ],
            })
          }
        >
          Add Rule
        </Button>
      </StyledForm>

      <NavigationWrapper>
        <StepNavigation
          onBack={onBack}
          onNext={handleSubmit(onSubmit)}
          isFinalStep={isFinalStep}
          disabled={Object.keys(errors).length > 0}
        />
      </NavigationWrapper>
    </FormContainer>
  );
};

export default ComplianceRulesConstructor;
