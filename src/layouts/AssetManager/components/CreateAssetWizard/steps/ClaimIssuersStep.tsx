/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ClaimType } from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  FormContainer,
  FieldLabel,
  FieldInput,
  Button,
  DescriptionText,
  NavigationWrapper,
  TrustedClaimTypesContainer,
  HeaderRow,
  IconWrapper,
  FieldRow,
  TrustedCheckboxLabel,
  StyledForm,
  StyledFormSection,
  FieldWrapper,
  StyledErrorMessage,
  CheckboxRow,
  ThemedCheckbox,
  ChipContainer,
  VenueSelectRow,
  CheckboxGrid,
  StyledLink,
} from '../styles';
import Chip from '../components/Chip';
import { WizardStepProps } from '../types';
import { splitCamelCase } from '~/helpers/formatters';
import StepNavigation from '../components/StepNavigation';
import { Icon } from '~/components';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import CreateCustomClaimModal from '../components/CreateCustomClaimModal';
import { useCustomClaims } from '~/hooks/polymesh/useCustomClaims';

type CustomClaimType = { type: ClaimType.Custom; customClaimTypeId: BigNumber };
type ClaimTypeValue = ClaimType | CustomClaimType;
type FormTrustedFor = ClaimTypeValue[] | null;

interface FormClaimIssuer {
  identity: string;
  trustedFor: FormTrustedFor;
}

const isCustomClaim = (
  claim: ClaimTypeValue,
): claim is { type: ClaimType.Custom; customClaimTypeId: BigNumber } => {
  return (
    typeof claim === 'object' &&
    'type' in claim &&
    claim.type === ClaimType.Custom
  );
};

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

  const [customClaimsByIssuer, setCustomClaimsByIssuer] = useState<
    Record<string, { id: BigNumber; name: string }[]>
  >({});
  const [customClaimInputByIssuer, setCustomClaimInputByIssuer] = useState<
    Record<string, string>
  >({});
  const {
    validateCustomClaim,
    createModalState,
    handleCreateModalClose,
    handleCreateModalOpen,
    handleCustomClaimCreated,
  } = useCustomClaims();

  useEffect(() => {
    const fetchCustomClaimNames = async () => {
      if (!sdk || !defaultValues.claimIssuers) return;

      const newCustomClaimsByIssuer: Record<
        string,
        { id: BigNumber; name: string }[]
      > = {};

      await Promise.all(
        defaultValues.claimIssuers.map(async (issuer, i) => {
          const issuerId = `issuer-${i}`;

          const customClaimIds = (issuer.trustedFor || [])
            .filter(isCustomClaim)
            .map((claim) => claim.customClaimTypeId);

          if (customClaimIds.length > 0) {
            const claimResults = await Promise.all(
              customClaimIds.map(async (id) => {
                try {
                  const details = await sdk.claims.getCustomClaimTypeById(id);
                  return details ? { id, name: details.name } : null;
                } catch (error) {
                  notifyError(
                    `Failed to fetch custom claim ${id.toString()}: ${(error as Error).message}`,
                  );
                  return null;
                }
              }),
            );

            const validClaims = claimResults.filter(
              (claim): claim is { id: BigNumber; name: string } =>
                claim !== null,
            );

            if (validClaims.length > 0) {
              newCustomClaimsByIssuer[issuerId] = validClaims;
            }
          }
        }),
      );

      setCustomClaimsByIssuer(newCustomClaimsByIssuer);
    };

    fetchCustomClaimNames();
  }, [sdk, defaultValues]);

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
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClaimIssuersFormData>({
    defaultValues: { claimIssuers: defaultValues.claimIssuers },
    resolver: yupResolver(validationSchema),
  });

  const watchedClaimIssuers = watch('claimIssuers');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'claimIssuers',
  });

  const handleRemoveIssuer = (index: number) => {
    const issuerId = `issuer-${index}`;

    setCustomClaimsByIssuer((prev) => {
      const newState = { ...prev };
      delete newState[issuerId];
      return newState;
    });

    setCustomClaimInputByIssuer((prev) => {
      const newState = { ...prev };
      delete newState[issuerId];
      return newState;
    });

    remove(index);
  };

  const handleAddCustomClaim = async (
    onChange: (value: ClaimTypeValue[] | null) => void,
    currentValue: ClaimTypeValue[] | null,
    issuerIndex: number,
  ) => {
    const issuerId = `issuer-${issuerIndex}`;
    const customClaimInput = customClaimInputByIssuer[issuerId] || '';

    if (!customClaimInput) return;

    const validClaim = await validateCustomClaim(customClaimInput);
    if (!validClaim) {
      // If it's a number ID that doesn't exist, error was already shown
      if (!Number.isNaN(Number(customClaimInput))) {
        return;
      }
      // Otherwise, show creation modal
      handleCreateModalOpen(customClaimInput, (newClaim) => {
        const issuerClaims = customClaimsByIssuer[issuerId] || [];
        if (issuerClaims.some((c) => c.id.eq(newClaim.id))) {
          notifyError('Custom claim already added');
          return;
        }

        setCustomClaimsByIssuer((prev) => ({
          ...prev,
          [issuerId]: [...issuerClaims, newClaim],
        }));
        setCustomClaimInputByIssuer((prev) => ({
          ...prev,
          [issuerId]: '',
        }));

        const customClaimValue: ClaimTypeValue = {
          type: ClaimType.Custom,
          customClaimTypeId: newClaim.id,
        };

        if (currentValue === null) {
          onChange([customClaimValue]);
        } else {
          onChange([...currentValue, customClaimValue]);
        }
      });
      return;
    }

    const issuerClaims = customClaimsByIssuer[issuerId] || [];
    if (issuerClaims.some((c) => c.id.eq(validClaim.id))) {
      notifyError('Custom claim already added');
      return;
    }

    setCustomClaimsByIssuer((prev) => ({
      ...prev,
      [issuerId]: [...issuerClaims, validClaim],
    }));
    setCustomClaimInputByIssuer((prev) => ({
      ...prev,
      [issuerId]: '',
    }));

    const customClaimValue: ClaimTypeValue = {
      type: ClaimType.Custom,
      customClaimTypeId: validClaim.id,
    };

    if (currentValue === null) {
      onChange([customClaimValue]);
    } else {
      onChange([...currentValue, customClaimValue]);
    }
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
          const issuerId = `issuer-${index}`;
          const issuerCustomClaims = customClaimsByIssuer[issuerId] || [];
          const issuerCustomClaimInput =
            customClaimInputByIssuer[issuerId] || '';
          const currentIssuer = watchedClaimIssuers?.[index];

          return (
            <StyledFormSection key={field.id}>
              <HeaderRow>
                <FieldLabel>Issuer #{index + 1}</FieldLabel>
                <IconWrapper onClick={() => handleRemoveIssuer(index)}>
                  <Icon name="Delete" size="20px" />
                </IconWrapper>
              </HeaderRow>
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Issuer DID</FieldLabel>
                  <FieldInput
                    placeholder="Enter issuer DID"
                    value={currentIssuer?.identity || ''}
                    {...register(`claimIssuers.${index}.identity` as const)}
                    $hasError={!!errors.claimIssuers?.[index]?.identity}
                  />
                </FieldRow>
                {errors.claimIssuers?.[index]?.identity && (
                  <StyledErrorMessage>
                    {errors.claimIssuers[index].identity.message}
                  </StyledErrorMessage>
                )}
              </FieldWrapper>
              <div>
                <FieldLabel>Trusted for Claim Types</FieldLabel>
                <Controller
                  name={`claimIssuers.${index}.trustedFor`}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <div>
                      <CheckboxRow>
                        <TrustedCheckboxLabel
                          htmlFor={`all-claim-types-${index}`}
                        >
                          <ThemedCheckbox
                            checked={value === null}
                            onChange={(e) => {
                              if (e.target.checked) {
                                onChange(null);
                                setCustomClaimsByIssuer((prev) => ({
                                  ...prev,
                                  [issuerId]: [],
                                }));
                              } else {
                                onChange([]);
                              }
                            }}
                            id={`all-claim-types-${index}`}
                          />
                          All Claim Types
                        </TrustedCheckboxLabel>
                      </CheckboxRow>
                      <TrustedClaimTypesContainer>
                        <CheckboxGrid>
                          {Object.values(ClaimType)
                            .filter(
                              (claim) =>
                                claim !== ClaimType.CustomerDueDiligence &&
                                claim !== ClaimType.Custom,
                            )
                            .map((claim) => (
                              <CheckboxRow key={claim}>
                                <TrustedCheckboxLabel
                                  htmlFor={`${claim}-${index}`}
                                >
                                  <ThemedCheckbox
                                    checked={
                                      Array.isArray(value) &&
                                      value.some((item) =>
                                        isCustomClaim(item)
                                          ? false
                                          : item === claim,
                                      )
                                    }
                                    onChange={(e) => {
                                      if (!Array.isArray(value)) {
                                        onChange(
                                          e.target.checked ? [claim] : [],
                                        );
                                        return;
                                      }

                                      if (e.target.checked) {
                                        onChange([...value, claim]);
                                      } else {
                                        onChange(
                                          value.filter((item) =>
                                            isCustomClaim(item)
                                              ? true
                                              : item !== claim,
                                          ),
                                        );
                                      }
                                    }}
                                    id={`${claim}-${index}`}
                                  />
                                  {splitCamelCase(claim)}
                                </TrustedCheckboxLabel>
                              </CheckboxRow>
                            ))}
                        </CheckboxGrid>
                        <FieldWrapper>
                          <FieldRow>
                            <FieldLabel>Custom Claim</FieldLabel>
                            <VenueSelectRow>
                              <FieldInput
                                placeholder="Enter claim name or ID"
                                value={issuerCustomClaimInput}
                                onChange={(e) =>
                                  setCustomClaimInputByIssuer((prev) => ({
                                    ...prev,
                                    [issuerId]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCustomClaim(
                                      onChange,
                                      value,
                                      index,
                                    );
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                onClick={() =>
                                  handleAddCustomClaim(onChange, value, index)
                                }
                              >
                                Add
                              </Button>
                            </VenueSelectRow>
                          </FieldRow>
                        </FieldWrapper>
                        <ChipContainer>
                          {issuerCustomClaims.map(({ id, name }) => (
                            <Chip
                              key={id.toString()}
                              label={`${id.toString()} - ${name}`}
                              onDelete={() => {
                                setCustomClaimsByIssuer((prev) => ({
                                  ...prev,
                                  [issuerId]: issuerCustomClaims.filter(
                                    (c) => !c.id.eq(id),
                                  ),
                                }));
                                if (Array.isArray(value)) {
                                  onChange(
                                    value.filter(
                                      (item) =>
                                        !isCustomClaim(item) ||
                                        !item.customClaimTypeId.eq(id),
                                    ),
                                  );
                                }
                              }}
                            />
                          ))}
                        </ChipContainer>
                      </TrustedClaimTypesContainer>
                    </div>
                  )}
                />
                {errors.claimIssuers?.[index]?.trustedFor && (
                  <StyledErrorMessage>
                    {errors.claimIssuers[index].trustedFor.message}
                  </StyledErrorMessage>
                )}
              </div>
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
      {createModalState.isOpen && (
        <CreateCustomClaimModal
          customClaimName={createModalState.pendingName}
          onClose={handleCreateModalClose}
          onSuccess={handleCustomClaimCreated}
        />
      )}
    </FormContainer>
  );
};

export default ClaimIssuersStep;
