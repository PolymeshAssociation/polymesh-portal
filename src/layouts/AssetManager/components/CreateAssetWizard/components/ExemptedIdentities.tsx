/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  useFieldArray,
  useFormContext,
  FieldError,
  Merge,
  FieldErrorsImpl,
} from 'react-hook-form';
import {
  FieldInput,
  FieldInputWithButton,
  FieldLabel,
  FieldRow,
  FieldWrapper,
  IconWrapper,
  Button,
  StyledErrorMessage,
} from '../styles';
import { Icon } from '~/components';

interface ExemptedIdentitiesProps {
  errors?:
    | Merge<
        FieldError,
        (
          | Merge<
              FieldError,
              FieldErrorsImpl<{
                identity: string;
              }>
            >
          | undefined
        )[]
      >
    | undefined;
  nestIndex: number;
}

const ExemptedIdentities: React.FC<ExemptedIdentitiesProps> = ({
  errors,
  nestIndex,
}) => {
  const { control, register, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `transferRestrictions.${nestIndex}.exemptedIdentities`,
    keyName: 'exemptedId',
  });

  const watchedIdentities = watch(
    `transferRestrictions.${nestIndex}.exemptedIdentities`,
  );

  return (
    <>
      {fields.length > 0 && (
        <FieldWrapper>
          <FieldRow>
            <FieldLabel>Exempted Identities</FieldLabel>
          </FieldRow>
        </FieldWrapper>
      )}
      {fields.map((field, index) => (
        <FieldWrapper key={field.exemptedId}>
          <FieldRow key={field.exemptedId}>
            <FieldInputWithButton>
              <FieldInput
                placeholder="Enter identity DID"
                {...register(
                  `transferRestrictions.${nestIndex}.exemptedIdentities.${index}.identity`,
                )}
                value={watchedIdentities?.[index]?.identity || ''}
              />
              <IconWrapper onClick={() => remove(index)}>
                <Icon name="Delete" size="20px" />
              </IconWrapper>
            </FieldInputWithButton>
          </FieldRow>
          {errors?.[index]?.identity?.message && (
            <StyledErrorMessage>
              {errors[index].identity.message}
            </StyledErrorMessage>
          )}
        </FieldWrapper>
      ))}
      <Button
        type="button"
        onClick={() => append({ id: crypto.randomUUID(), identity: '' })}
      >
        Add Exempted Identity
      </Button>
    </>
  );
};

export default ExemptedIdentities;
