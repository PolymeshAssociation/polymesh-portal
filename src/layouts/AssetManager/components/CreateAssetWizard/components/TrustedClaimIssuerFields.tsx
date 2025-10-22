/* eslint-disable react/jsx-props-no-spreading */
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { ClaimType, TrustedFor } from '@polymeshassociation/polymesh-sdk/types';
import React, { useMemo, useState } from 'react';
import { splitCamelCase } from '~/helpers/formatters';
import { notifyError } from '~/helpers/notifications';
import type { UseCustomClaimsReturn } from '~/hooks/polymesh/useCustomClaims';
import {
  CheckboxGrid,
  CheckboxRow,
  ChipContainer,
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldWrapper,
  Button as StyledButton,
  StyledErrorMessage,
  ThemedCheckbox,
  TrustedCheckboxLabel,
  TrustedClaimTypesContainer,
  VenueSelectRow,
} from '../styles';
import Chip from './Chip';
import CreateCustomClaimModal from './CreateCustomClaimModal';

const isCustomClaim = (
  claim: TrustedFor,
): claim is { type: ClaimType.Custom; customClaimTypeId: BigNumber } => {
  return (
    typeof claim === 'object' &&
    'type' in claim &&
    claim.type === ClaimType.Custom
  );
};

// Define the subset of ClaimType that can be used as TrustedFor (excludes CustomerDueDiligence and Custom)
type ValidClaimTypeForTrusted = Exclude<
  ClaimType,
  ClaimType.CustomerDueDiligence | ClaimType.Custom
>;

// Create a typed array of valid claim types
const VALID_CLAIM_TYPES_FOR_TRUSTED: ValidClaimTypeForTrusted[] = Object.values(
  ClaimType,
).filter(
  (claim): claim is ValidClaimTypeForTrusted =>
    claim !== ClaimType.CustomerDueDiligence && claim !== ClaimType.Custom,
);

interface TrustedClaimIssuerFieldsProps {
  // Identity field
  identityValue?: string;
  identityError?: string;
  onIdentityChange: (value: string) => void;
  // Trusted for field
  trustedForValue: TrustedFor[] | null;
  trustedForError?: string;
  onTrustedForChange: (value: TrustedFor[] | null) => void;
  // Custom claims hook
  customClaimsHook: UseCustomClaimsReturn;
  // Checkbox IDs for accessibility/uniqueness
  allClaimTypesCheckboxId?: string;
  claimTypeCheckboxIdPrefix?: string;
  // options for identity field
  identityDisabled?: boolean;
  showIdentityField?: boolean;
}

export const TrustedClaimIssuerFields: React.FC<
  TrustedClaimIssuerFieldsProps
> = ({
  identityValue = '',
  identityError,
  onIdentityChange,
  trustedForValue,
  trustedForError,
  onTrustedForChange,
  customClaimsHook,
  allClaimTypesCheckboxId = 'all-claim-types',
  claimTypeCheckboxIdPrefix = '',
  identityDisabled = false,
  showIdentityField = true,
}) => {
  const [customClaimInput, setCustomClaimInput] = useState('');

  const {
    validateCustomClaim,
    createModalState,
    handleCreateModalClose,
    handleCreateModalOpen,
    handleCustomClaimCreated,
    claimNames,
  } = customClaimsHook;

  // Derive custom claims from trustedForValue using cached claim names
  const customClaims = useMemo(() => {
    if (!Array.isArray(trustedForValue)) return [];

    return trustedForValue.filter(isCustomClaim).map((claim) => ({
      id: claim.customClaimTypeId,
      name: claimNames[claim.customClaimTypeId.toString()] || 'Loading...',
    }));
  }, [trustedForValue, claimNames]);

  const handleToggleAllClaimTypes = (checked: boolean) => {
    if (checked) {
      onTrustedForChange(null);
    } else {
      onTrustedForChange([]);
    }
  };

  const handleToggleClaimType = (
    claim: ValidClaimTypeForTrusted,
    checked: boolean,
  ) => {
    if (!Array.isArray(trustedForValue)) {
      onTrustedForChange(checked ? [claim] : []);
      return;
    }

    if (checked) {
      onTrustedForChange([...trustedForValue, claim]);
    } else {
      onTrustedForChange(
        trustedForValue.filter((item) =>
          isCustomClaim(item) ? true : item !== claim,
        ),
      );
    }
  };

  const handleAddCustomClaim = async () => {
    if (!customClaimInput) return;

    const validClaim = await validateCustomClaim(customClaimInput);
    if (!validClaim) {
      if (!Number.isNaN(Number(customClaimInput))) {
        return;
      }
      handleCreateModalOpen(customClaimInput, (newClaim) => {
        if (customClaims.some((c) => c.id.eq(newClaim.id))) {
          notifyError('Custom claim already added');
          return;
        }

        setCustomClaimInput('');

        const customClaimValue: TrustedFor = {
          type: ClaimType.Custom,
          customClaimTypeId: newClaim.id,
        };

        if (trustedForValue === null) {
          onTrustedForChange([customClaimValue]);
        } else {
          onTrustedForChange([...trustedForValue, customClaimValue]);
        }
      });
      return;
    }

    if (customClaims.some((c) => c.id.eq(validClaim.id))) {
      notifyError('Custom claim already added');
      return;
    }

    setCustomClaimInput('');

    const customClaimValue: TrustedFor = {
      type: ClaimType.Custom,
      customClaimTypeId: validClaim.id,
    };

    if (trustedForValue === null) {
      onTrustedForChange([customClaimValue]);
    } else {
      onTrustedForChange([...trustedForValue, customClaimValue]);
    }
  };

  const handleDeleteCustomClaim = (id: BigNumber) => {
    if (Array.isArray(trustedForValue)) {
      onTrustedForChange(
        trustedForValue.filter(
          (item) => !isCustomClaim(item) || !item.customClaimTypeId.eq(id),
        ),
      );
    }
  };

  return (
    <>
      {showIdentityField && (
        <FieldWrapper>
          <FieldRow>
            <FieldLabel>Issuer DID</FieldLabel>
            <FieldInput
              placeholder="Enter issuer DID"
              value={identityValue}
              onChange={(e) => onIdentityChange(e.target.value)}
              disabled={identityDisabled}
              $hasError={!!identityError}
            />
          </FieldRow>
          {identityError && (
            <StyledErrorMessage>{identityError}</StyledErrorMessage>
          )}
        </FieldWrapper>
      )}

      <div>
        <FieldLabel>Trusted for Claim Types</FieldLabel>
        <div>
          <CheckboxRow>
            <TrustedCheckboxLabel htmlFor={allClaimTypesCheckboxId}>
              <ThemedCheckbox
                checked={trustedForValue === null}
                onChange={(e) => handleToggleAllClaimTypes(e.target.checked)}
                id={allClaimTypesCheckboxId}
              />
              All Claim Types
            </TrustedCheckboxLabel>
          </CheckboxRow>
          <TrustedClaimTypesContainer>
            <CheckboxGrid>
              {VALID_CLAIM_TYPES_FOR_TRUSTED.map((claim) => (
                <CheckboxRow key={claim}>
                  <TrustedCheckboxLabel
                    htmlFor={`${claimTypeCheckboxIdPrefix}${claim}`}
                  >
                    <ThemedCheckbox
                      checked={
                        Array.isArray(trustedForValue) &&
                        trustedForValue.some((item) =>
                          isCustomClaim(item) ? false : item === claim,
                        )
                      }
                      onChange={(e) =>
                        handleToggleClaimType(claim, e.target.checked)
                      }
                      id={`${claimTypeCheckboxIdPrefix}${claim}`}
                    />
                    {splitCamelCase(claim)}
                  </TrustedCheckboxLabel>
                </CheckboxRow>
              ))}
            </CheckboxGrid>
            <FieldWrapper>
              <FieldRow>
                <FieldLabel>Custom Claim</FieldLabel>
                <VenueSelectRow>
                  <FieldInput
                    placeholder="Enter claim name or ID"
                    value={customClaimInput}
                    onChange={(e) => setCustomClaimInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomClaim();
                      }
                    }}
                  />
                  <StyledButton
                    type="button"
                    onClick={handleAddCustomClaim}
                    disabled={!customClaimInput}
                  >
                    Add
                  </StyledButton>
                </VenueSelectRow>
              </FieldRow>
            </FieldWrapper>
            {customClaims.length > 0 && (
              <ChipContainer>
                {customClaims.map(({ id, name }) => (
                  <Chip
                    key={id.toString()}
                    label={`${id.toString()} - ${name}`}
                    onDelete={() => handleDeleteCustomClaim(id)}
                  />
                ))}
              </ChipContainer>
            )}
          </TrustedClaimTypesContainer>
        </div>
        {trustedForError && (
          <StyledErrorMessage>{trustedForError}</StyledErrorMessage>
        )}
      </div>

      {createModalState.isOpen && (
        <CreateCustomClaimModal
          customClaimName={createModalState.pendingName}
          onClose={handleCreateModalClose}
          onSuccess={handleCustomClaimCreated}
        />
      )}
    </>
  );
};
