/* eslint-disable react/jsx-props-no-spreading */
import { useContext, useState } from 'react';
import {
  ClaimType,
  ScopeType,
  UnsubCallback,
} from '@polymeshassociation/polymesh-sdk/types';
import { useForm } from 'react-hook-form';
import { PolymeshContext } from '~/context/PolymeshContext';
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
  ISelectedClaimItem,
} from './constants';
import { createClaimsData, createPlaceholderByScopeType } from './helpers';
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';
import { ClaimsContext } from '~/context/ClaimsContext';

interface ICreateNewClaimProps {
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}
export const CreateNewClaim: React.FC<ICreateNewClaimProps> = ({
  toggleModal,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { refreshClaims } = useContext(ClaimsContext);
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
  const { handleStatusChange } = useTransactionStatus();

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

  const onSubmit = async (data: IFieldValues) => {
    if (!sdk) return;
    toggleModal();

    const claims = createClaimsData({ data, selectedClaims });
    let unsubCb: UnsubCallback | undefined;
    try {
      const addClaimsTx = await sdk.claims.addClaims({ claims });
      unsubCb = addClaimsTx.onStatusChange(handleStatusChange);
      await addClaimsTx.run();
      refreshClaims();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      if (unsubCb) {
        unsubCb();
      }
    }
  };

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
