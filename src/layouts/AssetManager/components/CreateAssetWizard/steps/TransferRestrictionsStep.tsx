/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  ClaimType,
  CountryCode,
  InputStatClaim,
  StatType,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useContext, useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Icon } from '~/components';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import ExemptedIdentities from '../components/ExemptedIdentities';
import StepNavigation from '../components/StepNavigation';
import {
  Button,
  DescriptionText,
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldWrapper,
  FormContainer,
  HeaderRow,
  IconWrapper,
  NavigationWrapper,
  StyledErrorMessage,
  StyledForm,
  StyledFormSection,
  StyledLink,
} from '../styles';
import { WizardData, WizardStepProps } from '../types';

const restrictionTypeLabels: Record<StatType, string> = {
  [StatType.Count]: 'Holder Count',
  [StatType.Balance]: 'Individual Percentage Ownership',
  [StatType.ScopedCount]: 'Holder Count with Claim',
  [StatType.ScopedBalance]: 'Total Percentage Ownership with Claim',
};

enum FormClaimType {
  Accredited = 'Accredited',
  NotAccredited = 'Accredited - Not Present',
  Affiliate = 'Affiliate',
  NotAffiliate = 'Affiliate - Not Present',
  Jurisdiction = 'Jurisdiction',
}

interface FormTransferRestriction {
  type: StatType | '';
  issuer?: string;
  claimType: FormClaimType | '';
  jurisdiction: CountryCode | '';
  max?: string;
  min?: string;
  exemptedIdentities: { identity: string }[];
}

interface TransferRestrictionFormData {
  transferRestrictions: FormTransferRestriction[];
}

const wizardClaimTypeToFormClaimType = (
  claimType: InputStatClaim,
): { claimType: FormClaimType; jurisdiction?: CountryCode } | undefined => {
  switch (claimType.type) {
    case ClaimType.Accredited:
      return {
        claimType: claimType.accredited
          ? FormClaimType.Accredited
          : FormClaimType.NotAccredited,
      };
    case ClaimType.Affiliate:
      return {
        claimType: claimType.affiliate
          ? FormClaimType.Affiliate
          : FormClaimType.NotAffiliate,
      };
    case ClaimType.Jurisdiction:
      return {
        claimType: FormClaimType.Jurisdiction,
        jurisdiction: claimType.countryCode,
      };
    default:
      return undefined;
  }
};

const formClaimTypeToWizardClaimType = (
  claimType: FormClaimType,
  jurisdiction: CountryCode | '',
): InputStatClaim => {
  switch (claimType) {
    case FormClaimType.Accredited:
      return { type: ClaimType.Accredited, accredited: true };
    case FormClaimType.NotAccredited:
      return { type: ClaimType.Accredited, accredited: false };
    case FormClaimType.Affiliate:
      return { type: ClaimType.Affiliate, affiliate: true };
    case FormClaimType.NotAffiliate:
      return { type: ClaimType.Affiliate, affiliate: false };
    case FormClaimType.Jurisdiction: {
      if (!jurisdiction) {
        throw new Error('Country is required');
      }
      return { type: ClaimType.Jurisdiction, countryCode: jurisdiction! };
    }
    default:
      throw new Error('Unsupported claim type');
  }
};

const createTransferRestrictionValidationSchema = (sdk: Polymesh | null) => {
  return yup.object().shape({
    transferRestrictions: yup.array().of(
      yup.object().shape({
        type: yup.string().required('Restriction type is required'),
        max: yup
          .string()
          .required('Maximum value is required')
          .test('is-valid-number', 'Must be a valid number', (value) => {
            if (!value) return false;
            const num = Number(value);
            return !Number.isNaN(num);
          })
          .test(
            'is-valid-range',
            'Must be between 0 and 100 for percentage',
            function isValidRange(value) {
              if (!value) return true;
              const num = Number(value);
              const isPercentage =
                this.parent.type === StatType.Balance ||
                this.parent.type === StatType.ScopedBalance;
              if (isPercentage) {
                return num >= 0 && num <= 100;
              }
              return num >= 0;
            },
          )
          .test(
            'is-whole-number',
            'Must be a whole number for count restrictions',
            function isWholeNumber(value) {
              if (!value) return true;
              const num = Number(value);
              const isCount =
                this.parent.type === StatType.Count ||
                this.parent.type === StatType.ScopedCount;
              if (isCount) {
                return Number.isInteger(num);
              }
              return true;
            },
          ),
        min: yup
          .string()
          .nullable()
          .test(
            'is-valid-number',
            'Must be a valid number if present',
            (value) => {
              if (!value) return true;
              const num = Number(value);
              return !Number.isNaN(num) && num >= 0;
            },
          )
          .test(
            'is-whole-number',
            'Must be a whole number for count restrictions',
            function isWholeNumberForCountRestrictions(value) {
              if (!value) return true;
              const num = Number(value);
              const isCount =
                this.parent.type === StatType.Count ||
                this.parent.type === StatType.ScopedCount;
              if (isCount) {
                return Number.isInteger(num);
              }
              return true;
            },
          )
          .test(
            'less-than-max',
            'Minimum value must be less than maximum value',
            function validateMinMax(value) {
              if (!value) return true;
              const min = Number(value);
              const max = Number(this.parent.max);
              if (Number.isNaN(min) || Number.isNaN(max)) return true;
              return min <= max;
            },
          ),
        claimType: yup.string().when('type', {
          is: (val: string) =>
            val === StatType.ScopedCount || val === StatType.ScopedBalance,
          then: (schema) => schema.required('Claim type is required'),
          otherwise: (schema) => schema.nullable(),
        }),
        issuer: yup.string().when('type', {
          is: (val: string) =>
            val === StatType.ScopedCount || val === StatType.ScopedBalance,
          then: (schema) =>
            schema
              .required('Claim issuer DID is required')
              .matches(/^0x[0-9a-fA-F]{64}$/, 'Must be a valid DID')
              .test(
                'is-valid-identity',
                'DID does not exist',
                async function validateIssuerDid(value) {
                  if (!value || !value.match(/^0x[0-9a-fA-F]{64}$/))
                    return true;
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
          otherwise: (schema) => schema.nullable(),
        }),
        jurisdiction: yup.string().when('claimType', {
          is: FormClaimType.Jurisdiction,
          then: (schema) => schema.required('Country is required'),
          otherwise: (schema) => schema.nullable(),
        }),
        exemptedIdentities: yup.array().of(
          yup.object().shape({
            identity: yup
              .string()
              .required('Identity DID is required')
              .matches(/^0x[0-9a-fA-F]{64}$/, 'Must be a valid DID')
              .test(
                'is-valid-did',
                'DID does not exist',
                async function validateExemptedDid(value) {
                  if (!value || !value.match(/^0x[0-9a-fA-F]{64}$/))
                    return true;
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
          }),
        ),
      }),
    ),
  });
};

const TransferRestrictionsStep: React.FC<WizardStepProps> = ({
  onBack,
  onComplete,
  defaultValues,
  isFinalStep,
  isLoading,
}) => {
  const {
    api: { sdk, polkadotApi },
  } = useContext(PolymeshContext);

  const [maxTransferRestrictions, setMaxTransferRestrictions] = useState<
    number | null
  >(null);

  // Fetch the maximum number of transfer restrictions from chain
  useEffect(() => {
    const fetchMaxRestrictions = async () => {
      if (!polkadotApi) return;

      try {
        const max = polkadotApi.consts.statistics.maxTransferConditionsPerAsset;
        setMaxTransferRestrictions(max.toNumber());
      } catch (error) {
        // Fallback to default value if query fails
        notifyError('Failed to fetch max transfer restrictions');
      }
    };

    fetchMaxRestrictions();
  }, [polkadotApi]);

  const methods = useForm<TransferRestrictionFormData>({
    defaultValues: {
      transferRestrictions: defaultValues.transferRestrictions.map(
        (restriction) => ({
          type: restriction.type,
          max: restriction.max.toString(),
          min:
            'min' in restriction && restriction.min
              ? restriction.min.toString()
              : undefined,
          issuer:
            'issuer' in restriction && restriction.issuer
              ? restriction.issuer
              : undefined,
          ...('claimType' in restriction && restriction.claimType
            ? wizardClaimTypeToFormClaimType(restriction.claimType)
            : {}),
          exemptedIdentities: restriction.exemptedIdentities.map(
            (identity) => ({
              identity,
            }),
          ),
        }),
      ),
    },
    resolver: yupResolver(createTransferRestrictionValidationSchema(sdk)),
    mode: 'onSubmit',
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'transferRestrictions',
  });

  const watchTransferRestrictions = methods.watch('transferRestrictions');
  const { errors } = methods.formState;

  const onSubmit = (data: TransferRestrictionFormData) => {
    const wizardData = {
      ...defaultValues,
      transferRestrictions: data.transferRestrictions.map((restriction) => {
        if (
          restriction.type === StatType.ScopedCount ||
          restriction.type === StatType.ScopedBalance
        ) {
          return {
            type: restriction.type,
            max: restriction.max ? new BigNumber(restriction.max) : undefined,
            min: restriction.min ? new BigNumber(restriction.min) : undefined,
            issuer: restriction.issuer,
            claimType: restriction.claimType
              ? formClaimTypeToWizardClaimType(
                  restriction.claimType,
                  restriction.jurisdiction,
                )
              : undefined,
            exemptedIdentities: restriction.exemptedIdentities.map(
              ({ identity }) => identity,
            ),
          };
        }
        return {
          type: restriction.type,
          max: new BigNumber(restriction.max || '0'),
          exemptedIdentities: restriction.exemptedIdentities.map(
            ({ identity }) => identity,
          ),
        };
      }),
    } as WizardData;
    onComplete(wizardData);
  };

  const selectedTypes = watchTransferRestrictions.map((r) => r.type);

  return (
    <FormContainer>
      <h2>Transfer Restrictions</h2>
      <DescriptionText>
        Define transfer restrictions for your asset, such as holder count and
        percentage ownership limits. These restrictions are enforced at the
        protocol level. These restrictions work alongside compliance rules to
        enforce regulatory compliance for your asset. Learn more at{' '}
        <StyledLink
          href="https://developers.polymesh.network/compliance/transfer-restrictions/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Transfer Restrictions Documentation
        </StyledLink>
        .
      </DescriptionText>

      <FormProvider {...methods}>
        <StyledForm onSubmit={methods.handleSubmit(onSubmit)}>
          {fields.map((field, index) => {
            const restriction = watchTransferRestrictions[index];
            const isScoped =
              restriction?.type === StatType.ScopedCount ||
              restriction?.type === StatType.ScopedBalance;

            const typeError = errors?.transferRestrictions?.[index]?.type;
            const jurisdictionError =
              errors?.transferRestrictions?.[index]?.jurisdiction;
            const claimTypeError =
              errors?.transferRestrictions?.[index]?.claimType;
            const issuerError = errors?.transferRestrictions?.[index]?.issuer;
            const maxError = errors?.transferRestrictions?.[index]?.max;
            const minError = errors?.transferRestrictions?.[index]?.min;
            const exemptedIdentitiesError =
              errors?.transferRestrictions?.[index]?.exemptedIdentities;

            return (
              <StyledFormSection key={field.id}>
                <HeaderRow>
                  <FieldLabel>Restriction #{index + 1}</FieldLabel>
                  <IconWrapper onClick={() => remove(index)}>
                    <Icon name="Delete" size="20px" />
                  </IconWrapper>
                </HeaderRow>

                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel>Type</FieldLabel>
                    <FieldSelect
                      {...methods.register(
                        `transferRestrictions.${index}.type`,
                      )}
                      onChange={(e) => {
                        const newType = e.target.value as StatType;
                        methods.setValue(`transferRestrictions.${index}`, {
                          type: newType,
                          max: '',
                          min: '',
                          claimType: '',
                          issuer: '',
                          jurisdiction: '',
                          exemptedIdentities: [],
                        });
                      }}
                      $hasError={!!typeError}
                    >
                      {Object.values(StatType)
                        .filter(
                          (type) =>
                            !selectedTypes.includes(type) ||
                            type === restriction.type ||
                            type === StatType.ScopedCount ||
                            type === StatType.ScopedBalance,
                        )
                        .map((type) => (
                          <option key={type} value={type}>
                            {restrictionTypeLabels[type]}
                          </option>
                        ))}
                    </FieldSelect>
                  </FieldRow>
                  {typeError &&
                    typeof typeError === 'object' &&
                    'message' in typeError && (
                      <StyledErrorMessage>
                        {typeError.message}
                      </StyledErrorMessage>
                    )}
                </FieldWrapper>

                {isScoped && (
                  <>
                    <FieldWrapper>
                      <FieldRow>
                        <FieldLabel>Claim Type</FieldLabel>
                        <FieldSelect
                          {...methods.register(
                            `transferRestrictions.${index}.claimType`,
                          )}
                          $hasError={!!claimTypeError}
                        >
                          <option value="" disabled>
                            Select claim type
                          </option>
                          {Object.values(FormClaimType).map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </FieldSelect>
                      </FieldRow>
                      {claimTypeError &&
                        typeof claimTypeError === 'object' &&
                        'message' in claimTypeError && (
                          <StyledErrorMessage>
                            {claimTypeError.message}
                          </StyledErrorMessage>
                        )}
                    </FieldWrapper>
                    {restriction.claimType === FormClaimType.Jurisdiction && (
                      <FieldWrapper>
                        <FieldRow>
                          <FieldLabel>Country</FieldLabel>
                          <FieldSelect
                            {...methods.register(
                              `transferRestrictions.${index}.jurisdiction`,
                            )}
                            $hasError={!!jurisdictionError}
                          >
                            <option value="" disabled>
                              Select country
                            </option>
                            {Object.entries(countryCodes).map(
                              ([code, countryName]) => (
                                <option key={code} value={code}>
                                  {countryName.name}
                                </option>
                              ),
                            )}
                          </FieldSelect>
                        </FieldRow>
                        {jurisdictionError && (
                          <StyledErrorMessage>
                            {jurisdictionError.message}
                          </StyledErrorMessage>
                        )}
                      </FieldWrapper>
                    )}
                    <FieldWrapper>
                      <FieldRow>
                        <FieldLabel>Claim Issuer DID</FieldLabel>
                        <FieldInput
                          {...methods.register(
                            `transferRestrictions.${index}.issuer`,
                          )}
                          placeholder="Enter claim issuer DID"
                          value={watchTransferRestrictions[index]?.issuer || ''}
                          $hasError={!!issuerError}
                        />
                      </FieldRow>
                      {issuerError && (
                        <StyledErrorMessage>
                          {issuerError.message}
                        </StyledErrorMessage>
                      )}
                    </FieldWrapper>
                  </>
                )}
                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel>
                      Max{' '}
                      {restriction?.type === StatType.Count ||
                      restriction?.type === StatType.ScopedCount
                        ? 'Count'
                        : 'Percentage'}
                    </FieldLabel>
                    <FieldInput
                      type="string"
                      placeholder={`Enter maximum ${
                        restriction?.type === StatType.Count ||
                        restriction?.type === StatType.ScopedCount
                          ? 'count'
                          : 'percentage'
                      }`}
                      {...methods.register(`transferRestrictions.${index}.max`)}
                      value={watchTransferRestrictions[index]?.max || ''}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      onInput={(e: React.FormEvent<HTMLInputElement>) => {
                        const input = e.currentTarget;
                        input.value = input.value.replace(/[^\d.]/g, '');
                      }}
                      $hasError={!!maxError}
                    />
                  </FieldRow>
                  {maxError && (
                    <StyledErrorMessage>{maxError.message}</StyledErrorMessage>
                  )}
                </FieldWrapper>

                {isScoped && (
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel>
                        Min{' '}
                        {restriction?.type === StatType.ScopedCount
                          ? 'Count'
                          : 'Percentage'}
                      </FieldLabel>
                      <FieldInput
                        type="string"
                        placeholder={`Enter minimum ${
                          restriction?.type === StatType.ScopedCount
                            ? 'count'
                            : 'percentage'
                        }`}
                        {...methods.register(
                          `transferRestrictions.${index}.min`,
                        )}
                        value={watchTransferRestrictions[index]?.min || ''}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const input = e.currentTarget;
                          input.value = input.value.replace(/[^\d.]/g, '');
                        }}
                        $hasError={!!minError}
                      />
                    </FieldRow>
                    {minError && (
                      <StyledErrorMessage>
                        {minError.message}
                      </StyledErrorMessage>
                    )}
                  </FieldWrapper>
                )}

                <ExemptedIdentities
                  nestIndex={index}
                  errors={exemptedIdentitiesError}
                />
              </StyledFormSection>
            );
          })}

          <Button
            type="button"
            onClick={() =>
              append({
                type: Object.values(StatType).filter(
                  (type) =>
                    !selectedTypes.includes(type) ||
                    type === StatType.ScopedCount ||
                    type === StatType.ScopedBalance,
                )[0],
                max: '',
                claimType: '',
                issuer: '',
                jurisdiction: '',
                exemptedIdentities: [],
              })
            }
            disabled={
              maxTransferRestrictions !== null &&
              fields.length >= maxTransferRestrictions
            }
          >
            Add Transfer Restriction
            {maxTransferRestrictions !== null &&
              fields.length >= maxTransferRestrictions &&
              ` (Maximum ${maxTransferRestrictions} reached)`}
          </Button>
        </StyledForm>
      </FormProvider>

      <NavigationWrapper>
        <StepNavigation
          onBack={onBack}
          onNext={methods.handleSubmit(onSubmit)}
          isFinalStep={isFinalStep}
          disabled={Object.keys(errors).length > 0}
          isLoading={isLoading}
        />
      </NavigationWrapper>
    </FormContainer>
  );
};

export default TransferRestrictionsStep;
