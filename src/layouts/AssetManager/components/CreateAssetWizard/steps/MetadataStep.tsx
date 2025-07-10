/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import {
  MetadataLockStatus,
  MetadataType,
  RegisterMetadataParams,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useContext } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Icon } from '~/components';
import { AssetContext } from '~/context/AssetContext';
import StepNavigation from '../components/StepNavigation';
import {
  Button,
  DescriptionText,
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldTextarea,
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

type FormMetadataEntry = Omit<RegisterMetadataParams, 'details'> & {
  details?: {
    lockStatus: MetadataLockStatus;
    lockedUntil?: string;
    expiry: string | null;
  };
  value: string;
  id?: number;
  type: MetadataType;
};

type FormData = Omit<WizardData, 'metadata'> & {
  metadata: FormMetadataEntry[];
};

const getMinDateTime = () => {
  const tomorrow = new Date(Date.now() + 86400000);
  return tomorrow.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
};

// New Yup validation schemas for metadata entries
const createMetadataDetailsSchema = () =>
  yup
    .object()
    .shape({
      lockStatus: yup.string().required('Lock status is required'),
      lockedUntil: yup.string().when('lockStatus', {
        is: MetadataLockStatus.LockedUntil,
        then: (schema) =>
          schema
            .required('Locked until is required')
            .test('is-future-date', 'Date must be in the future', (value) => {
              if (!value) return false;
              return new Date(value) > new Date();
            }),
        otherwise: (schema) => schema.transform(() => undefined).notRequired(),
      }),
      expiry: yup
        .string()
        .nullable()
        .test('is-future-date', 'Date must be in the future', (value) => {
          if (!value) return true;
          return new Date(value) > new Date();
        }),
    })
    .nullable();

const globalMetadataSchema = yup.object().shape({
  type: yup.string().oneOf(['Global']).required(),
  name: yup.string().required('Selection is required'),
  id: yup.number().required('ID is required'),
  value: yup.string().required('Value is required'),
  details: createMetadataDetailsSchema(),
});

const localMetadataSchema = yup.object().shape({
  type: yup.string().oneOf(['Local']).required(),
  name: yup.string().required('Name is required'),
  value: yup.string().required('Value is required'),
  details: createMetadataDetailsSchema(),
});

const metadataEntrySchema = yup.lazy((value) => {
  return value?.type === 'Global' ? globalMetadataSchema : localMetadataSchema;
});

const metadataStepSchema = yup.object().shape({
  metadata: yup.array().of(metadataEntrySchema),
});

const MetadataStep: React.FC<WizardStepProps> = ({
  onComplete,
  onBack,
  defaultValues,
  isFinalStep,
  isLoading,
}) => {
  const { globalMetadata } = useContext(AssetContext);

  // Convert default metadata dates into string format (yyyy-mm-dd)
  const defaultMetadata: FormMetadataEntry[] = defaultValues.metadata.map(
    (entry) => {
      if ('details' in entry && entry.details) {
        return {
          ...entry,
          details: {
            ...entry.details,
            lockedUntil:
              'lockedUntil' in entry.details && entry.details.lockedUntil
                ? entry.details.lockedUntil.toISOString().split('T')[0]
                : undefined,
            expiry: entry.details.expiry
              ? entry.details.expiry.toISOString().split('T')[0]
              : undefined,
          },
          value: entry.value,
        } as FormMetadataEntry;
      }
      return { ...entry } as FormMetadataEntry;
    },
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: { ...defaultValues, metadata: defaultMetadata },
    resolver: yupResolver(metadataStepSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'metadata',
  });

  const watchMetadata = watch('metadata');

  const handleLockStatusChange = (index: number, value: string) => {
    if (value !== 'LockedUntil') {
      setValue(`metadata.${index}.details.lockedUntil`, undefined, {
        shouldValidate: true,
      });
      clearErrors(`metadata.${index}.details.lockedUntil`);
    }
  };

  const onSubmit = (data: FormData) => {
    const normalizedMetadata = data.metadata.map((entry) => {
      if (entry.details) {
        return {
          ...entry,
          details: {
            ...entry.details,
            lockedUntil: entry.details.lockedUntil
              ? new Date(entry.details.lockedUntil)
              : undefined,
            expiry: entry.details.expiry
              ? new Date(entry.details.expiry)
              : null,
          },
        };
      }
      return entry;
    });
    onComplete({ ...data, metadata: normalizedMetadata });
  };

  return (
    <FormContainer>
      <h2>Metadata</h2>
      <DescriptionText>
        Define and configure metadata attributes for your Polymesh asset.
        Metadata supports a type definition which can optionally be used to
        provide a data structure for external software or smart contracts to
        parse the stored value or an external URL for further details. Values
        can optionally be locked to ensure data integrity. For details, visit
        the{' '}
        <StyledLink
          href="https://developers.polymesh.network/core/assets/metadata/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Metadata Documentation
        </StyledLink>
        .
      </DescriptionText>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index: number) => {
          const metadataEntry = watchMetadata[index];
          const isGlobal = metadataEntry?.type === 'Global';
          const globalOption = isGlobal
            ? globalMetadata.find((o) => o.name === metadataEntry?.name)
            : undefined;

          const handleTypeChange = () => {
            setValue(`metadata.${index}.name`, '');
            setValue(`metadata.${index}.specs.description`, '');
            setValue(`metadata.${index}.specs.typeDef`, '');
            setValue(`metadata.${index}.specs.url`, '');
            setValue(`metadata.${index}.id`, undefined);
          };

          const handleGlobalNameChange = (value: string) => {
            const option = globalMetadata.find((o) => o.name === value);
            setValue(
              `metadata.${index}.id`,
              option ? Number(option.id) : undefined,
            );
          };

          return (
            <StyledFormSection key={field.id}>
              <HeaderRow>
                <FieldLabel>Entry #{index + 1} - Definition</FieldLabel>
                <IconWrapper onClick={() => remove(index)}>
                  <Icon name="Delete" size="20px" />
                </IconWrapper>
              </HeaderRow>
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel htmlFor={`metadata.${index}.type`}>
                    Type
                  </FieldLabel>
                  <FieldSelect
                    id={`metadata.${index}.type`}
                    {...register(`metadata.${index}.type` as const, {
                      onChange: () => handleTypeChange(),
                    })}
                    value={metadataEntry?.type || 'Local'}
                  >
                    <option value="Global">Existing Type (Global)</option>
                    <option value="Local">User Defined Type (Local)</option>
                  </FieldSelect>
                </FieldRow>
              </FieldWrapper>
              {isGlobal ? (
                <>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel htmlFor={`metadata.${index}.name`}>
                        Name
                      </FieldLabel>
                      <FieldSelect
                        id={`metadata.${index}.name`}
                        {...register(`metadata.${index}.name` as const, {
                          onChange: (e) =>
                            handleGlobalNameChange(e.target.value),
                        })}
                        value={metadataEntry?.name || ''}
                        $hasError={!!errors.metadata?.[index]?.name}
                      >
                        <option disabled value="">
                          Select a type
                        </option>
                        {globalMetadata.map((o) => (
                          <option key={o.id.toString()} value={o.name}>
                            {o.name}
                          </option>
                        ))}
                      </FieldSelect>
                    </FieldRow>
                    {errors.metadata?.[index]?.name && (
                      <StyledErrorMessage>
                        {errors.metadata[index].name.message}
                      </StyledErrorMessage>
                    )}
                  </FieldWrapper>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel
                        htmlFor={`metadata.${index}.specs.description`}
                      >
                        Description
                      </FieldLabel>
                      <FieldTextarea
                        id={`metadata.${index}.specs.description`}
                        readOnly
                        value={globalOption?.specs?.description || ''}
                      />
                    </FieldRow>
                  </FieldWrapper>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel htmlFor={`metadata.${index}.specs.typeDef`}>
                        Type Definition
                      </FieldLabel>
                      <FieldInput
                        id={`metadata.${index}.specs.typeDef`}
                        readOnly
                        value={globalOption?.specs?.typeDef || ''}
                      />
                    </FieldRow>
                  </FieldWrapper>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel htmlFor={`metadata.${index}.specs.url`}>
                        URL
                      </FieldLabel>
                      <FieldInput
                        id={`metadata.${index}.specs.url`}
                        readOnly
                        value={globalOption?.specs?.url || ''}
                      />
                    </FieldRow>
                  </FieldWrapper>
                </>
              ) : (
                <>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel htmlFor={`metadata.${index}.name`}>
                        Name
                      </FieldLabel>
                      <FieldInput
                        id={`metadata.${index}.name`}
                        placeholder="Enter name"
                        {...register(`metadata.${index}.name` as const, {
                          required: true,
                        })}
                        value={metadataEntry?.name || ''}
                        $hasError={!!errors.metadata?.[index]?.name}
                      />
                    </FieldRow>
                    {errors.metadata?.[index]?.name && (
                      <StyledErrorMessage>
                        {errors.metadata[index].name.message}
                      </StyledErrorMessage>
                    )}
                  </FieldWrapper>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel
                        htmlFor={`metadata.${index}.specs.description`}
                      >
                        Description
                      </FieldLabel>
                      <FieldTextarea
                        id={`metadata.${index}.specs.description`}
                        placeholder="Enter description (optional)"
                        {...register(
                          `metadata.${index}.specs.description` as const,
                        )}
                        value={metadataEntry?.specs?.description || ''}
                      />
                    </FieldRow>
                  </FieldWrapper>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel htmlFor={`metadata.${index}.specs.typeDef`}>
                        Type Definition
                      </FieldLabel>
                      <FieldInput
                        id={`metadata.${index}.specs.typeDef`}
                        placeholder="Enter type definition (optional)"
                        {...register(
                          `metadata.${index}.specs.typeDef` as const,
                        )}
                        value={metadataEntry?.specs?.typeDef || ''}
                      />
                    </FieldRow>
                  </FieldWrapper>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel htmlFor={`metadata.${index}.specs.url`}>
                        URL
                      </FieldLabel>
                      <FieldInput
                        id={`metadata.${index}.specs.url`}
                        placeholder="Enter URL (optional)"
                        {...register(`metadata.${index}.specs.url` as const)}
                        value={metadataEntry?.specs?.url || ''}
                      />
                    </FieldRow>
                  </FieldWrapper>
                </>
              )}
              <HeaderRow>
                <FieldLabel>Entry #{index + 1} - Properties</FieldLabel>
              </HeaderRow>
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel htmlFor={`metadata.${index}.value`}>
                    Value
                  </FieldLabel>
                  <FieldInput
                    id={`metadata.${index}.value`}
                    placeholder="Enter value"
                    {...register(`metadata.${index}.value` as const, {
                      required: true,
                    })}
                    value={metadataEntry?.value || ''}
                    $hasError={!!errors.metadata?.[index]?.value}
                  />
                </FieldRow>
                {errors.metadata?.[index]?.value && (
                  <StyledErrorMessage>
                    {errors.metadata[index].value.message}
                  </StyledErrorMessage>
                )}
              </FieldWrapper>
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel htmlFor={`metadata.${index}.details.lockStatus`}>
                    Lock Status
                  </FieldLabel>
                  <FieldSelect
                    id={`metadata.${index}.details.lockStatus`}
                    {...register(
                      `metadata.${index}.details.lockStatus` as const,
                      {
                        onChange: (e) =>
                          handleLockStatusChange(index, e.target.value),
                      },
                    )}
                    value={metadataEntry?.details?.lockStatus || 'Unlocked'}
                    prefix="Enter lock status"
                  >
                    <option value="Unlocked">Unlocked</option>
                    <option value="Locked">Locked</option>
                    <option value="LockedUntil">Locked Until</option>
                  </FieldSelect>
                </FieldRow>
              </FieldWrapper>

              {metadataEntry?.details?.lockStatus === 'LockedUntil' && (
                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel
                      htmlFor={`metadata.${index}.details.lockedUntil`}
                    >
                      Locked Until
                    </FieldLabel>
                    <FieldInput
                      id={`metadata.${index}.details.lockedUntil`}
                      type="datetime-local"
                      min={getMinDateTime()}
                      {...register(
                        `metadata.${index}.details.lockedUntil` as const,
                      )}
                      value={metadataEntry?.details?.lockedUntil || ''}
                      $hasError={
                        !!errors.metadata?.[index]?.details?.lockedUntil
                      }
                    />
                  </FieldRow>
                  {errors.metadata?.[index]?.details?.lockedUntil && (
                    <StyledErrorMessage>
                      {errors.metadata[index].details.lockedUntil.message}
                    </StyledErrorMessage>
                  )}
                </FieldWrapper>
              )}
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel htmlFor={`metadata.${index}.details.expiry`}>
                    Expiry Date (optional)
                  </FieldLabel>
                  <FieldInput
                    id={`metadata.${index}.details.expiry`}
                    type="datetime-local"
                    min={getMinDateTime()}
                    {...register(`metadata.${index}.details.expiry` as const)}
                    value={metadataEntry?.details?.expiry || ''}
                  />
                </FieldRow>
                {errors.metadata?.[index]?.details?.expiry && (
                  <StyledErrorMessage>
                    {errors.metadata[index].details.expiry.message}
                  </StyledErrorMessage>
                )}
              </FieldWrapper>
            </StyledFormSection>
          );
        })}
        <Button
          type="button"
          onClick={() =>
            append({
              details: {
                lockStatus: MetadataLockStatus.Unlocked,
                expiry: null,
              },
              type: MetadataType.Local,
              value: '',
              name: '',
              id: undefined,
              specs: {},
            } as FormMetadataEntry)
          }
        >
          Add Metadata
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

export default MetadataStep;
