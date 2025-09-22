/* eslint-disable react/jsx-props-no-spreading */
import {
  SecurityIdentifier,
  SecurityIdentifierType,
} from '@polymeshassociation/polymesh-sdk/types';
import React from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import {
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldWrapper,
  StyledErrorMessage,
} from '../../../../CreateAssetWizard/styles';

interface SecurityIdentifierFormFieldsProps {
  register: UseFormRegister<SecurityIdentifier>;
  errors: FieldErrors<SecurityIdentifier>;
  transactionInProcess: boolean;
  onSubmit: () => void;
}

export const SecurityIdentifierFormFields: React.FC<
  SecurityIdentifierFormFieldsProps
> = ({ register, errors, transactionInProcess, onSubmit }) => {
  return (
    <>
      <FieldWrapper>
        <FieldRow>
          <FieldLabel>Identifier Type</FieldLabel>
          <FieldSelect
            $hasError={!!errors.type}
            disabled={transactionInProcess}
            {...register('type')}
          >
            {Object.values(SecurityIdentifierType).map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </FieldSelect>
        </FieldRow>
        {errors.type && (
          <StyledErrorMessage>{errors.type.message}</StyledErrorMessage>
        )}
      </FieldWrapper>

      <FieldWrapper>
        <FieldRow>
          <FieldLabel>Identifier Value</FieldLabel>
          <FieldInput
            type="text"
            placeholder="Enter identifier value"
            $hasError={!!errors.value}
            disabled={transactionInProcess}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmit();
              }
            }}
            {...register('value')}
          />
        </FieldRow>
        {errors.value && (
          <StyledErrorMessage>{errors.value.message}</StyledErrorMessage>
        )}
      </FieldWrapper>
    </>
  );
};
