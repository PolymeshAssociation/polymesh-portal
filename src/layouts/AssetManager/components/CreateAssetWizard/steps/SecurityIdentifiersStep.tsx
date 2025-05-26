/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { SecurityIdentifierType } from '@polymeshassociation/polymesh-sdk/types';
import {
  isIsinValid,
  isCusipValid,
  isLeiValid,
  isFigiValid,
} from '@polymeshassociation/polymesh-sdk/utils';
import {
  FormContainer,
  FieldLabel,
  FieldInput,
  FieldSelect,
  Button,
  FieldRow,
  DescriptionText,
  NavigationWrapper,
  IconWrapper,
  HeaderRow,
  StyledForm,
  StyledFormSection,
  StyledErrorMessage,
  FieldWrapper,
  StyledLink,
} from '../styles';
import { WizardData, WizardStepProps } from '../types';
import StepNavigation from '../components/StepNavigation';
import { Icon } from '~/components';

// Define yup schema for security identifiers
const securityIdentifiersSchema = yup.object({
  securityIdentifiers: yup.array().of(
    yup.object({
      type: yup.string().required(),
      value: yup
        .string()
        .required('Identifier value is required')
        .test(
          'identifier-valid',
          'Invalid security identifier',
          function validateIdentifier(value) {
            const { type } = this.parent;
            let error = false;
            switch (type) {
              case SecurityIdentifierType.Isin: {
                if (!isIsinValid(value)) {
                  error = true;
                }
                break;
              }
              case SecurityIdentifierType.Lei: {
                if (!isLeiValid(value)) {
                  error = true;
                }
                break;
              }
              case SecurityIdentifierType.Figi: {
                if (!isFigiValid(value)) {
                  error = true;
                }
                break;
              }
              // CINS and CUSIP use the same validation
              default: {
                if (!isCusipValid(value)) {
                  error = true;
                }
              }
            }
            return !error;
          },
        ),
    }),
  ),
});

const SecurityIdentifiersStep: React.FC<WizardStepProps> = ({
  onComplete,
  onBack,
  defaultValues,
  isFinalStep,
  isLoading,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WizardData>({
    defaultValues,
    resolver: yupResolver(securityIdentifiersSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'securityIdentifiers',
  });

  const onSubmit = (data: WizardData) => {
    onComplete(data);
  };

  return (
    <FormContainer>
      <h2>Security Identifiers</h2>
      <DescriptionText>
        Link standardized security identifiers, like ISIN, CUSIP, FIGI, or LEI
        to your asset. These identifiers help integrate your asset with global
        financial systems. Learn more at{' '}
        <StyledLink
          href="https://developers.polymesh.network/core/assets/#securities-identifiers"
          target="_blank"
        >
          Securities Identifiers Documentation
        </StyledLink>
        .
      </DescriptionText>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <StyledFormSection key={field.id}>
            <HeaderRow>
              <FieldLabel>Identifier #{index + 1}</FieldLabel>
              <IconWrapper onClick={() => remove(index)}>
                <Icon name="Delete" size="20px" />
              </IconWrapper>
            </HeaderRow>
            <FieldWrapper>
              <FieldRow>
                <FieldLabel>Type</FieldLabel>
                <FieldSelect
                  {...register(`securityIdentifiers.${index}.type` as const)}
                >
                  {Object.values(SecurityIdentifierType).map((type) => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </FieldSelect>
              </FieldRow>
            </FieldWrapper>

            <FieldWrapper>
              <FieldRow>
                <FieldLabel>Value</FieldLabel>
                <FieldInput
                  placeholder="Enter identifier value"
                  $hasError={!!errors.securityIdentifiers?.[index]?.value}
                  {...register(`securityIdentifiers.${index}.value` as const)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </FieldRow>
              {errors.securityIdentifiers?.[index]?.value && (
                <StyledErrorMessage>
                  {errors.securityIdentifiers[index].value?.message}
                </StyledErrorMessage>
              )}
            </FieldWrapper>
          </StyledFormSection>
        ))}
        <Button
          type="button"
          onClick={() =>
            append({ type: SecurityIdentifierType.Isin, value: '' })
          }
        >
          Add Identifier
        </Button>
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

export default SecurityIdentifiersStep;
