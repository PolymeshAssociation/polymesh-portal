/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { AssetDocument } from '@polymeshassociation/polymesh-sdk/types';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FormContainer,
  FieldLabel,
  FieldInput,
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
} from '../styles';
import { Icon } from '~/components';
import { WizardStepProps } from '../types';
import StepNavigation from '../components/StepNavigation';

type WizardAssetDocument = Omit<AssetDocument, 'filedAt'> & {
  filedAt?: string;
};

type FormData = {
  documents: WizardAssetDocument[];
};

// Add Yup schema for documents
const documentsStepSchema = yup.object().shape({
  documents: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Document name is required'),
      uri: yup.string().required('Document link (URI/URL) is required'),
      contentHash: yup
        .string()
        .nullable()
        .test(
          'is-hex',
          'Must begin with "0x" followed by a hex string',
          (value) => {
            if (!value) return true;
            return /^0x[0-9A-Fa-f]+$/.test(value);
          },
        ),
    }),
  ),
});

const DocumentsStep: React.FC<WizardStepProps> = ({
  onComplete,
  onBack,
  defaultValues,
  isFinalStep,
}) => {
  const defaultDocuments = defaultValues.documents.map((document) => {
    const normalizedDocument = {
      ...document,
      filedAt: document.filedAt
        ? document.filedAt.toISOString().split('T')[0]
        : undefined,
    };
    return normalizedDocument;
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { documents: defaultDocuments },
    resolver: yupResolver(documentsStepSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documents',
  });

  const onSubmit = (data: FormData) => {
    const normalizedData = data.documents.map((document) => ({
      ...document,
      contentHash: document.contentHash || undefined,
      filedAt: document.filedAt ? new Date(document.filedAt) : undefined,
    })) as AssetDocument[];
    onComplete({ documents: normalizedData });
  };

  return (
    <FormContainer>
      <h2>Documents</h2>
      <DescriptionText>
        Link essential documentation to your asset. For example register
        prospectuses, offering memorandums, shareholder agreements, and other
        legal documents. A hash of the document can be recorded to create an
        immutable audit trail of asset documentation on the Polymesh blockchain.
      </DescriptionText>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <StyledFormSection key={field.id}>
            <HeaderRow>
              <FieldLabel>Document #{index + 1}</FieldLabel>
              <IconWrapper onClick={() => remove(index)}>
                <Icon name="Delete" size="20px" />
              </IconWrapper>
            </HeaderRow>
            <FieldWrapper>
              <FieldRow>
                <FieldLabel htmlFor={`documents.${index}.name`}>
                  Name
                </FieldLabel>
                <FieldInput
                  id={`documents.${index}.name`}
                  placeholder="Enter the document name"
                  $hasError={!!errors.documents?.[index]?.name}
                  {...register(`documents.${index}.name` as const)}
                />
              </FieldRow>
              {errors.documents?.[index]?.name && (
                <StyledErrorMessage>
                  {errors.documents[index].name?.message}
                </StyledErrorMessage>
              )}
            </FieldWrapper>
            <FieldWrapper>
              <FieldRow>
                <FieldLabel htmlFor={`documents.${index}.uri`}>
                  Document Link
                </FieldLabel>
                <FieldInput
                  id={`documents.${index}.uri`}
                  placeholder="Enter the document URL"
                  $hasError={!!errors.documents?.[index]?.uri}
                  {...register(`documents.${index}.uri` as const)}
                />
              </FieldRow>
              {errors.documents?.[index]?.uri && (
                <StyledErrorMessage>
                  {errors.documents[index].uri?.message}
                </StyledErrorMessage>
              )}
            </FieldWrapper>
            <FieldWrapper>
              <FieldRow>
                <FieldLabel htmlFor={`documents.${index}.contentHash`}>
                  Content Hash
                </FieldLabel>
                <FieldInput
                  id={`documents.${index}.contentHash`}
                  placeholder='Content Hash (e.g. "0x..." optional)'
                  $hasError={!!errors.documents?.[index]?.contentHash}
                  {...register(`documents.${index}.contentHash` as const)}
                />
              </FieldRow>
              {errors.documents?.[index]?.contentHash && (
                <StyledErrorMessage>
                  {errors.documents[index].contentHash?.message}
                </StyledErrorMessage>
              )}
            </FieldWrapper>
            <FieldWrapper>
              <FieldRow>
                <FieldLabel htmlFor={`documents.${index}.filedAt`}>
                  Filed At (optional)
                </FieldLabel>
                <FieldInput
                  id={`documents.${index}.filedAt`}
                  type="date"
                  placeholder="Filed date (optional)"
                  {...register(`documents.${index}.filedAt` as const)}
                />
              </FieldRow>
            </FieldWrapper>
            <FieldWrapper>
              <FieldRow>
                <FieldLabel htmlFor={`documents.${index}.type`}>
                  Document Type
                </FieldLabel>
                <FieldInput
                  id={`documents.${index}.type`}
                  placeholder="Type (optional)"
                  {...register(`documents.${index}.type` as const, {
                    setValueAs: (v) => (v === '' ? undefined : v),
                  })}
                />
              </FieldRow>
            </FieldWrapper>
          </StyledFormSection>
        ))}
        <Button
          type="button"
          onClick={() =>
            append({
              name: '',
              uri: '',
              contentHash: undefined,
              filedAt: '',
              type: undefined,
            })
          }
        >
          Add Document
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

export default DocumentsStep;
