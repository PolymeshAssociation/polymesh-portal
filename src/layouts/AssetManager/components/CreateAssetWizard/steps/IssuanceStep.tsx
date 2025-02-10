/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FormContainer,
  DescriptionText,
  NavigationWrapper,
  FieldRow,
  FieldWrapper,
  FieldLabel,
  FieldInput,
  FieldSelect,
  StyledErrorMessage,
  StyledForm,
  StyledFormSection,
} from '../styles';
import { WizardStepProps } from '../types';
import StepNavigation from '../components/StepNavigation';
import { PortfolioContext } from '~/context/PortfolioContext';

interface IssuanceFormData {
  initialSupply: number;
  portfolioId: number | 'default';
}

// Add helper function to return the validation schema using isDivisible
const getValidationSchema = (isDivisible: boolean) =>
  yup.object().shape({
    initialSupply: yup
      .number()
      .transform((value, originalValue) =>
        typeof originalValue === 'string' && originalValue.trim() === ''
          ? undefined
          : Number(value),
      )
      .typeError('Amount must be a number')
      .min(0, 'Amount must not be a non-negative number')
      .test(
        'is-decimal',
        `${isDivisible ? 'Maximum 6 decimal places' : 'Amount must be a whole number'}`,
        function checkDecimals(value) {
          if (value == null) return true;
          const valueStr = value.toString();
          if (isDivisible) {
            return /^-?\d+(\.\d{1,6})?$/.test(valueStr);
          }
          return /^-?\d+$/.test(valueStr);
        },
      ),
    portfolioId: yup.mixed(),
  });

const IssuanceStep: React.FC<WizardStepProps> = ({
  onBack,
  onComplete,
  defaultValues,
  isFinalStep,
  isLoading,
}) => {
  const { allPortfolios } = useContext(PortfolioContext);
  const { isDivisible } = defaultValues;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IssuanceFormData>({
    mode: 'onChange', // added for real-time validation
    defaultValues: {
      initialSupply: defaultValues.initialSupply?.toNumber(),
      portfolioId: defaultValues.portfolioId?.toNumber() || 'default',
    },
    resolver: yupResolver(getValidationSchema(isDivisible)),
  });

  const onSubmit = (formData: IssuanceFormData) => {
    const wizardData = {
      ...defaultValues,
      initialSupply:
        !formData.initialSupply || Number.isNaN(formData.initialSupply)
          ? undefined
          : new BigNumber(formData.initialSupply),
      portfolioId:
        formData.portfolioId === 'default'
          ? undefined
          : new BigNumber(formData.portfolioId as unknown as number),
    };
    onComplete(wizardData);
  };

  return (
    <FormContainer>
      <h2>Issuance</h2>
      <DescriptionText>
        Configure the initial token supply for your Polymesh asset. Set the
        number of tokens and designate a destination portfolio for the newly
        created tokens.
      </DescriptionText>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <StyledFormSection>
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Quantity to Issue</FieldLabel>
              <FieldInput
                type="text"
                placeholder="Enter token amount (optional)"
                $hasError={!!errors.initialSupply}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const input = e.currentTarget;
                  input.value = input.value.replace(/[^\d.]/g, '');
                }}
                {...register('initialSupply')}
              />
            </FieldRow>
            {errors.initialSupply && (
              <StyledErrorMessage>
                {errors.initialSupply.message as string}
              </StyledErrorMessage>
            )}
          </FieldWrapper>
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Portfolio</FieldLabel>
              <FieldSelect {...register('portfolioId' as const)}>
                {allPortfolios.map(
                  (p) =>
                    p.id && (
                      <option key={p.id.toString()} value={p.id}>
                        {p.id === 'default' ? 'Default' : `${p.id} - ${p.name}`}
                      </option>
                    ),
                )}
              </FieldSelect>
            </FieldRow>
          </FieldWrapper>
        </StyledFormSection>
      </StyledForm>
      <NavigationWrapper>
        <StepNavigation
          onBack={onBack}
          onNext={handleSubmit(onSubmit)}
          isFinalStep={isFinalStep}
          disabled={Object.keys(errors).length > 0}
          isLoading={isLoading}
        />
      </NavigationWrapper>
    </FormContainer>
  );
};

export default IssuanceStep;
