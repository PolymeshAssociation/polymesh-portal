/* eslint-disable react/jsx-props-no-spreading */
import { ClaimType, ScopeType } from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '~/components';
import { Button, DropdownSelect, Heading, Text } from '~/components/UiKit';
import { ClaimsContext } from '~/context/ClaimsContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { useWindowWidth } from '~/hooks/utility';
import { DescriptionText } from '~/layouts/AssetManager/components/CreateAssetWizard/styles';
import { StyledLink } from '~/layouts/Claims/components/CreateNewClaim/styles';
import { NewClaimItem } from './components/NewClaimItem';
import {
  CLAIM_ITEMS,
  FORM_CONFIG,
  IFieldValues,
  ISelectedClaimItem,
} from './constants';
import { createClaimsData, createPlaceholderByScopeType } from './helpers';
import {
  StyledButtonsWrapper,
  StyledErrorMessage,
  StyledInput,
  StyledInputWrapper,
  StyledLabel,
  StyledScrollableWrapper,
} from './styles';

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
  const { executeTransaction, isTransactionInProgress } =
    useTransactionStatusContext();
  const { isMobile } = useWindowWidth();

  const handleScopeChange = (option: string | null) => {
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
    try {
      await executeTransaction(sdk.claims.addClaims({ claims }), {
        onSuccess: () => {
          refreshClaims();
        },
      });
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  return (
    <Modal handleClose={toggleModal}>
      <Heading type="h4" marginBottom={24}>
        Create New Claim
      </Heading>
      <StyledScrollableWrapper>
        <DescriptionText>
          Issue an attestation about another identity&apos;s compliance status
          or characteristics. Claims can include KYC verification, accreditation
          status, jurisdiction, or custom attestations. These claims are used by
          asset issuers to enforce compliance rules for transfers.{' '}
          <StyledLink
            href="https://developers.polymesh.network/compliance/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more
          </StyledLink>
          .
        </DescriptionText>{' '}
        <StyledInputWrapper $marginBottom={16}>
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
          <StyledInputWrapper $marginTop={16}>
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
        {!isMobile && (
          <Button variant="modalSecondary" onClick={toggleModal}>
            Cancel
          </Button>
        )}
        <Button
          variant="modalPrimary"
          disabled={
            !isValid ||
            !selectedClaims.length ||
            isTransactionInProgress ||
            selectedClaims.some(
              ({ claimType, code }) =>
                claimType === ClaimType.Jurisdiction && !code,
            )
          }
          onClick={handleSubmit(onSubmit)}
        >
          Create
        </Button>
      </StyledButtonsWrapper>
    </Modal>
  );
};
