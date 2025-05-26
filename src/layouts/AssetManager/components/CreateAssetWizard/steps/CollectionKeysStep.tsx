/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  GlobalCollectionKeyInput,
  MetadataType,
} from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  FormContainer,
  FieldLabel,
  FieldInput,
  FieldSelect,
  Button,
  FieldRow,
  DescriptionText,
  NavigationWrapper,
  HeaderRow,
  IconWrapper,
  FieldTextarea,
  StyledForm,
  StyledFormSection,
  StyledErrorMessage,
  FieldWrapper,
  StyledLink,
} from '../styles';
import { WizardData, WizardStepProps } from '../types';
import StepNavigation from '../components/StepNavigation';
import { Icon } from '~/components';
import { AssetContext } from '~/context/AssetContext';

type FormCollectionKeyInput =
  | {
      type: MetadataType.Global;
      id: BigNumber;
      name?: string;
    }
  | {
      type: MetadataType.Local;
      name: string;
      spec: { description?: string; typeDef?: string; url?: string };
    };

// In your form data, override collectionKeys with our form type
type FormWizardData = {
  collectionKeys: FormCollectionKeyInput[];
};

// Define validation schemas for Global and Local keys
const globalKeySchema = yup.object().shape({
  type: yup.string().oneOf(['Global']).required(),
  id: yup.mixed().required('ID is required'),
  name: yup.string().required('Selection is required'),
});

const localKeySchema = yup.object().shape({
  type: yup.string().oneOf(['Local']).required(),
  name: yup.string().required('Name is required'),
  spec: yup.object().shape({
    description: yup.string().nullable(),
    typeDef: yup.string().nullable(),
    url: yup.string().nullable(),
  }),
});

// Use yup.lazy to select the appropriate schema based on key type,
// so that lower level errors are preserved.
const collectionKeySchema = yup.lazy((value) => {
  if (value?.type === 'Global') {
    return globalKeySchema;
  }
  return localKeySchema;
});

const collectionKeysSchema = yup.object().shape({
  collectionKeys: yup.array().of(collectionKeySchema),
});

// New helper functions to parse default input and convert form data to wizardData.
const parseDefaultInput = (defaultValues: WizardData): FormWizardData => ({
  collectionKeys: defaultValues.collectionKeys || [],
});

const convertFormDataToWizardData = (
  formData: FormWizardData,
  defaultValues: WizardData,
) => ({
  ...defaultValues,
  collectionKeys: formData.collectionKeys,
});

const CollectionKeysStep: React.FC<WizardStepProps> = ({
  onComplete,
  onBack,
  defaultValues,
  isFinalStep,
  isLoading,
}) => {
  // Use form type with our updated collectionKeys type
  const { globalMetadata } = useContext(AssetContext);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormWizardData>({
    defaultValues: parseDefaultInput(defaultValues),
    resolver: yupResolver(collectionKeysSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'collectionKeys',
  });
  const watchCollectionKeys = watch('collectionKeys');

  const onSubmit = (data: FormWizardData) => {
    const wizardData = convertFormDataToWizardData(data, defaultValues);
    onComplete(wizardData);
  };

  return (
    <FormContainer>
      <h2>Collection Keys</h2>
      <DescriptionText>
        Configure metadata keys for your NFT collection that define the
        properties each token can have. Use standardized global keys for
        interoperability or create custom local keys. Each key represents a
        trait or attribute that can be assigned to individual NFTs, enabling
        rich asset characterization and enhanced trading capabilities. Learn
        more about{' '}
        <StyledLink
          href="https://developers.polymesh.network/core/assets/nft/#collection-metadata-keys"
          target="_blank"
        >
          Collection Metadata Keys
        </StyledLink>
        .
      </DescriptionText>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => {
          const collectionKey = watchCollectionKeys[index];
          const isGlobal = collectionKey?.type === MetadataType.Global;
          const globalOption = isGlobal
            ? globalMetadata.find(
                (o) =>
                  o.id.toString() ===
                  (collectionKey as GlobalCollectionKeyInput).id.toString(),
              )
            : undefined;

          const handleTypeChange = (value: string) => {
            if (value === 'Global') {
              setValue(`collectionKeys.${index}`, {
                type: MetadataType.Global,
                id: new BigNumber(0),
                name: '',
              });
            } else {
              setValue(`collectionKeys.${index}`, {
                type: MetadataType.Local,
                name: '',
                spec: { description: '', typeDef: '', url: '' },
              });
            }
          };

          const handleGlobalNameChange = (value: string) => {
            const option = globalMetadata.find((o) => o.name === value);
            setValue(
              `collectionKeys.${index}.id`,
              option?.id || new BigNumber(0),
            );
          };

          return (
            <StyledFormSection key={field.id}>
              <HeaderRow>
                <FieldLabel>Collection Key #{index + 1}</FieldLabel>
                <IconWrapper onClick={() => remove(index)}>
                  <Icon name="Delete" size="20px" />
                </IconWrapper>
              </HeaderRow>
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel htmlFor={`collectionKeys.${index}.type`}>
                    Type
                  </FieldLabel>
                  <FieldSelect
                    id={`collectionKeys.${index}.type`}
                    {...register(`collectionKeys.${index}.type` as const, {
                      onChange: (e) => handleTypeChange(e.target.value),
                    })}
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
                      <FieldLabel htmlFor={`collectionKeys.${index}.name`}>
                        Name
                      </FieldLabel>
                      <FieldSelect
                        id={`collectionKeys.${index}.name`}
                        {...register(`collectionKeys.${index}.name` as const, {
                          onChange: (e) =>
                            handleGlobalNameChange(e.target.value),
                        })}
                        $hasError={!!errors.collectionKeys?.[index]?.name}
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
                    {errors.collectionKeys?.[index]?.name && (
                      <StyledErrorMessage>
                        {errors.collectionKeys[index].name.message}
                      </StyledErrorMessage>
                    )}
                  </FieldWrapper>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel>Description</FieldLabel>
                      <FieldTextarea
                        readOnly
                        value={globalOption?.specs.description || ''}
                      />
                    </FieldRow>
                  </FieldWrapper>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel>Type Definition</FieldLabel>
                      <FieldInput
                        readOnly
                        value={globalOption?.specs.typeDef || ''}
                      />
                    </FieldRow>
                  </FieldWrapper>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel>URL</FieldLabel>
                      <FieldInput
                        readOnly
                        value={globalOption?.specs.url || ''}
                      />
                    </FieldRow>
                  </FieldWrapper>
                </>
              ) : (
                <>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel htmlFor={`collectionKeys.${index}.name`}>
                        Name
                      </FieldLabel>
                      <FieldInput
                        id={`collectionKeys.${index}.name`}
                        placeholder="Enter name"
                        {...register(`collectionKeys.${index}.name` as const, {
                          required: true,
                        })}
                        $hasError={!!errors.collectionKeys?.[index]?.name}
                      />
                    </FieldRow>
                    {errors.collectionKeys?.[index]?.name && (
                      <StyledErrorMessage>
                        {errors.collectionKeys[index].name.message}
                      </StyledErrorMessage>
                    )}
                  </FieldWrapper>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel
                        htmlFor={`collectionKeys.${index}.spec.description`}
                      >
                        Description
                      </FieldLabel>
                      <FieldTextarea
                        id={`collectionKeys.${index}.spec.description`}
                        placeholder="Enter description (optional)"
                        {...register(
                          `collectionKeys.${index}.spec.description` as const,
                        )}
                      />
                    </FieldRow>
                  </FieldWrapper>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel
                        htmlFor={`collectionKeys.${index}.spec.typeDef`}
                      >
                        Type Definition
                      </FieldLabel>
                      <FieldInput
                        id={`collectionKeys.${index}.spec.typeDef`}
                        placeholder="Enter type definition (optional)"
                        {...register(
                          `collectionKeys.${index}.spec.typeDef` as const,
                        )}
                      />
                    </FieldRow>
                  </FieldWrapper>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel htmlFor={`collectionKeys.${index}.spec.url`}>
                        URL
                      </FieldLabel>
                      <FieldInput
                        id={`collectionKeys.${index}.spec.url`}
                        placeholder="Enter URL (optional)"
                        {...register(
                          `collectionKeys.${index}.spec.url` as const,
                        )}
                      />
                    </FieldRow>
                  </FieldWrapper>
                </>
              )}
            </StyledFormSection>
          );
        })}
        <Button
          type="button"
          onClick={() =>
            append({
              type: MetadataType.Local,
              name: '',
              spec: { description: '', typeDef: '', url: '' },
            })
          }
        >
          Add Collection Key
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

export default CollectionKeysStep;
