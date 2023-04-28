/* eslint-disable react/jsx-props-no-spreading */
import { useState } from 'react';
import { ClaimType, ScopeType } from '@polymeshassociation/polymesh-sdk/types';
import { useForm } from 'react-hook-form';
import { Modal } from '~/components';
import { Heading, Button, Text } from '~/components/UiKit';
import DropdownSelect from './components/DropdownSelect';
import { NewClaimItem } from './components/NewClaimItem';
import {
  StyledScrollableWrapper,
  StyledButtonsWrapper,
  StyledInput,
  StyledLabel,
  StyledInputWrapper,
  StyledErrorMessage,
} from './styles';
import {
  CLAIM_ITEMS,
  FORM_CONFIG,
  IFieldValues,
  INPUT_NAMES,
  ISelectedClaimItem,
} from './constants';
import { createPlaceholderByScopeType } from './helpers';

interface ICreateNewClaimProps {
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}
export const CreateNewClaim: React.FC<ICreateNewClaimProps> = ({
  toggleModal,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<IFieldValues>(FORM_CONFIG);
  const [selectedScope, setSelectedScope] = useState<ScopeType | null>(null);
  const [selectedClaims, setSelectedClaims] = useState<ISelectedClaimItem[]>(
    [],
  );

  const handleScopeChange = (option: string) => {
    setSelectedScope(option as ScopeType);
    setValue('scopeType', option as ScopeType, {
      shouldValidate: true,
    });
  };

  const handleAddClaim = (newClaim: ISelectedClaimItem) => {
    if (
      !selectedClaims.find(({ claimType }) => claimType === newClaim.claimType)
    ) {
      setSelectedClaims((prev) => [...prev, newClaim]);
    }

    setSelectedClaims((prev) => {
      const updatedClaims = prev.map((oldClaim) => {
        if (oldClaim.claimType === newClaim.claimType) {
          return newClaim;
        }
        return oldClaim;
      });
      return updatedClaims;
    });
  };

  const handleDeleteClaim = (claim: ClaimType) => {
    setSelectedClaims((prev) =>
      prev.filter(({ claimType }) => claimType !== claim),
    );
  };

  const onSubmit = (data: IFieldValues) => {};

  return (
    <Modal handleClose={toggleModal}>
      <Heading type="h4" marginBottom={24}>
        Create New Claim
      </Heading>
      <StyledScrollableWrapper>
        <StyledInputWrapper marginBottom={16}>
          <StyledLabel htmlFor="targetDid">Target DID</StyledLabel>
          <StyledInput
            placeholder="Enter DID"
            id="targetDid"
            {...register('target')}
          />
          {!!errors.target?.message && (
            <StyledErrorMessage>{errors.target.message}</StyledErrorMessage>
          )}
        </StyledInputWrapper>
        <DropdownSelect
          label="Scope"
          placeholder="Select Scope"
          onChange={handleScopeChange}
          options={Object.values(ScopeType)}
          error={errors.scopeType?.message}
        />
        {selectedScope && (
          <StyledInputWrapper marginTop={16}>
            <StyledLabel htmlFor="scopeValue">Scope Value</StyledLabel>
            <StyledInput
              placeholder={createPlaceholderByScopeType(selectedScope)}
              id="scopeValue"
              {...register('scopeValue')}
            />
            {!!errors.scopeValue?.message && (
              <StyledErrorMessage>
                {errors.scopeValue.message}
              </StyledErrorMessage>
            )}
          </StyledInputWrapper>
        )}
        <Text size="large" bold marginTop={36} marginBottom={22}>
          Claim Type
        </Text>
        {CLAIM_ITEMS.map(({ value, label }) => (
          <NewClaimItem
            key={value}
            value={value}
            label={label}
            handleAdd={handleAddClaim}
            handleDelete={handleDeleteClaim}
          />
        ))}
      </StyledScrollableWrapper>
      <StyledButtonsWrapper>
        <Button variant="modalSecondary" onClick={toggleModal}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          disabled={!isValid || !selectedClaims.length}
          onClick={handleSubmit(onSubmit)}
        >
          Create
        </Button>
      </StyledButtonsWrapper>
    </Modal>
  );
};
