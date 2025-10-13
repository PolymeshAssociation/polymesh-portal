/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import { AssetDocument } from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Icon, Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { hashFile } from '~/helpers/documentHash';
import { notifyError } from '~/helpers/notifications';
import {
  DescriptionText,
  FieldInput,
  FieldInputWithButton,
  FieldLabel,
  FieldRow,
  FieldWrapper,
  StyledErrorMessage,
  StyledLink,
} from '../../../CreateAssetWizard/styles';
import {
  FieldActionButton,
  InfoMessage,
  ModalActions,
  ModalContainer,
  ModalContent,
} from '../../styles';

interface IAddDocumentForm {
  name: string;
  uri: string;
  contentHash?: string;
  filedAt?: string;
  type?: string;
}

interface IAddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (
    document: AssetDocument,
    onTransactionRunning?: () => void | Promise<void>,
  ) => Promise<void>;
  transactionInProcess: boolean;
}

// Validation schema for adding document
const addDocumentSchema = yup.object().shape({
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
  filedAt: yup.string().optional(),
  type: yup.string().optional(),
});

export const AddDocumentModal: React.FC<IAddDocumentModalProps> = ({
  isOpen,
  onClose,
  onAddDocument,
  transactionInProcess,
}) => {
  const [isHashing, setIsHashing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<IAddDocumentForm>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      uri: '',
      contentHash: '',
      filedAt: '',
      type: '',
    },
    resolver: yupResolver(addDocumentSchema),
  });

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsHashing(true);
      try {
        const hash = await hashFile(file);
        setValue('contentHash', hash, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } catch (error) {
        notifyError(
          `Failed to hash file: ${(error as Error).message || 'Unknown error'}`,
        );
      } finally {
        setIsHashing(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [setValue],
  );

  const handleHashButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (formData: IAddDocumentForm) => {
      // Create the new document
      const newDocument: AssetDocument = {
        name: formData.name.trim(),
        uri: formData.uri.trim(),
        contentHash: formData.contentHash?.trim() || undefined,
        filedAt: formData.filedAt ? new Date(formData.filedAt) : undefined,
        type: formData.type?.trim() || undefined,
      };

      await onAddDocument(newDocument, handleClose);
    },
    [onAddDocument, handleClose],
  );

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="700px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Add Asset Document
          </Heading>

          <DescriptionText>
            Link essential documentation to your asset, such as prospectuses,
            agreements and more. A hash of the document can be recorded to
            create an immutable audit trail of asset documentation on the
            Polymesh blockchain. For more information, visit the{' '}
            <StyledLink
              href="https://developers.polymesh.network/core/assets/#document-references"
              target="_blank"
              rel="noopener noreferrer"
            >
              Polymesh Asset Documentation
            </StyledLink>
            .
          </DescriptionText>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel htmlFor="name">Document Name</FieldLabel>
              <FieldInput
                id="name"
                placeholder="Enter the document name"
                $hasError={!!errors.name}
                {...register('name')}
              />
            </FieldRow>
            {errors.name && (
              <StyledErrorMessage>{errors.name.message}</StyledErrorMessage>
            )}
          </FieldWrapper>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel htmlFor="uri">Document Link</FieldLabel>
              <FieldInput
                id="uri"
                placeholder="Enter the document URL"
                $hasError={!!errors.uri}
                {...register('uri')}
              />
            </FieldRow>
            {errors.uri && (
              <StyledErrorMessage>{errors.uri.message}</StyledErrorMessage>
            )}
          </FieldWrapper>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel htmlFor="contentHash">Content Hash</FieldLabel>
              <FieldInputWithButton>
                <FieldInput
                  id="contentHash"
                  placeholder='Content Hash (e.g. "0x..." optional)'
                  $hasError={!!errors.contentHash}
                  {...register('contentHash')}
                />
                <FieldActionButton
                  type="button"
                  onClick={handleHashButtonClick}
                  disabled={isHashing || transactionInProcess}
                  title="Upload file to generate SHA-256 hash"
                >
                  <Icon name="UploadIcon" size="24px" />
                </FieldActionButton>

                {/* Hidden file input trigger for by the above styled button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept="*/*"
                />
              </FieldInputWithButton>
            </FieldRow>
            {errors.contentHash && (
              <StyledErrorMessage>
                {errors.contentHash.message}
              </StyledErrorMessage>
            )}
            <InfoMessage>
              Optionally upload a file to generate a SHA-256 hash, or manually
              enter a hash value with &quot;0x&quot; prefix.
            </InfoMessage>
          </FieldWrapper>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel htmlFor="filedAt">Filed At (optional)</FieldLabel>
              <FieldInput
                id="filedAt"
                type="date"
                placeholder="Filed date (optional)"
                {...register('filedAt')}
              />
            </FieldRow>
          </FieldWrapper>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel htmlFor="type">Document Type</FieldLabel>
              <FieldInput
                id="type"
                placeholder="Type (optional)"
                {...register('type')}
              />
            </FieldRow>
          </FieldWrapper>

          <ModalActions>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              disabled={transactionInProcess}
            >
              {transactionInProcess ? 'Adding...' : 'Add Document'}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
