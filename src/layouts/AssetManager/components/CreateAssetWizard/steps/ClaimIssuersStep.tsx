/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import { TrustedFor } from '@polymeshassociation/polymesh-sdk/types';
import React, { useContext } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Icon } from '~/components';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useCustomClaims } from '~/hooks/polymesh/useCustomClaims';
import StepNavigation from '../components/StepNavigation';
import { TrustedClaimIssuerFields } from '../components/TrustedClaimIssuerFields';
import {
  Button,
  DescriptionText,
  FieldLabel,
  FormContainer,
  HeaderRow,
  IconWrapper,
  NavigationWrapper,
  StyledForm,
  StyledFormSection,
  StyledLink,
} from '../styles';
import { WizardStepProps } from '../types';

type FormTrustedFor = TrustedFor[] | null;

interface FormClaimIssuer {
  identity: string;
  trustedFor: FormTrustedFor;
}

interface ClaimIssuersFormData {
  claimIssuers: FormClaimIssuer[];
}

const ClaimIssuersStep: React.FC<WizardStepProps> = ({
  onBack,
  onComplete,
  defaultValues,
  isFinalStep,
  isLoading,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const customClaimsHook = useCustomClaims();

  const validationSchema = yup.object().shape({
    claimIssuers: yup.array().of(
      yup.object().shape({
        identity: yup
          .string()
          .required('Issuer DID is required')
          .matches(/^0x[0-9a-fA-F]{64}$/, 'Issuer DID must be valid')
          .test(
            'is-valid-identity',
            'Issuer DID does not exist',
            async function validateDid(value) {
              if (!value || !value.match(/^0x[0-9a-fA-F]{64}$/)) return true;
              if (!sdk) return false;
              try {
                return await sdk.identities.isIdentityValid({
                  identity: value,
                });
              } catch (error) {
                return false;
              }
            },
          ),
        trustedFor: yup
          .array()
          .nullable()
          .test(
            'has-claims',
            'At least one claim type is required',
            (value) => {
              // If trustedFor is null, it means "All Claim Types" is selected
              if (value === null) return true;
              // Otherwise, there must be at least one claim
              return Array.isArray(value) && value.length > 0;
            },
          ),
      }),
    ),
  });

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClaimIssuersFormData>({
    defaultValues: { claimIssuers: defaultValues.claimIssuers },
    resolver: yupResolver(validationSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'claimIssuers',
  });

  const watchedClaimIssuers = watch('claimIssuers');

  const handleRemoveIssuer = (index: number) => {
    remove(index);
  };

  const onSubmit = (data: ClaimIssuersFormData) => {
    const processedData = { ...defaultValues, ...data };
    onComplete(processedData);
  };

  return (
    <FormContainer>
      <h2>Claim Issuers</h2>
      <DescriptionText>
        Assign trusted entities who can issue regulatory and compliance claims
        for your asset. These claim issuers validate investor requirements
        through verifiable claims such as KYC, accreditation status, and
        jurisdiction checks. Each issuer can be trusted for specific claim types
        or all compliance verifications. Learn more at{' '}
        <StyledLink
          href="https://developers.polymesh.network/compliance/#trusted-claim-issuers"
          target="_blank"
          rel="noopener noreferrer"
        >
          Trusted Claim Issuers Documentation
        </StyledLink>
        .
      </DescriptionText>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => {
          return (
            <StyledFormSection key={field.id}>
              <HeaderRow>
                <FieldLabel>Issuer #{index + 1}</FieldLabel>
                <IconWrapper onClick={() => handleRemoveIssuer(index)}>
                  <Icon name="Delete" size="20px" />
                </IconWrapper>
              </HeaderRow>
              <TrustedClaimIssuerFields
                identityValue={watchedClaimIssuers?.[index]?.identity || ''}
                identityError={errors.claimIssuers?.[index]?.identity?.message}
                onIdentityChange={(value) =>
                  setValue(`claimIssuers.${index}.identity`, value, {
                    shouldValidate: true,
                  })
                }
                trustedForValue={
                  watchedClaimIssuers?.[index]?.trustedFor || null
                }
                trustedForError={
                  errors.claimIssuers?.[index]?.trustedFor?.message
                }
                onTrustedForChange={(value) =>
                  setValue(`claimIssuers.${index}.trustedFor`, value, {
                    shouldValidate: true,
                  })
                }
                customClaimsHook={customClaimsHook}
                allClaimTypesCheckboxId={`all-claim-types-${index}`}
                claimTypeCheckboxIdPrefix={`${index}-`}
              />
            </StyledFormSection>
          );
        })}
        <Button
          type="button"
          onClick={() => {
            append({ identity: '', trustedFor: null });
          }}
        >
          Add Claim Issuer
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

export default ClaimIssuersStep;
