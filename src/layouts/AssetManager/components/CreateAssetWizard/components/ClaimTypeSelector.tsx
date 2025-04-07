import React, { useState, useContext } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { ClaimType, ScopeType } from '@polymeshassociation/polymesh-sdk/types';
import {
  FieldLabel,
  FieldRow,
  FieldWrapper,
  FieldSelect,
  FieldInput,
  Button,
  TrustedClaimTypesContainer,
  StyledErrorMessage,
} from '../styles';
import { useCustomClaims } from '~/hooks/polymesh/useCustomClaims';
import { splitCamelCase } from '~/helpers/formatters';
import CreateCustomClaimModal from './CreateCustomClaimModal';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { PolymeshContext } from '~/context/PolymeshContext';

type ExtendedScopeType = ScopeType | 'None';

interface ClaimTypeSelectorProps {
  onAddClaim: (claim: {
    scopeValue: string;
    scopeType: ExtendedScopeType;
    jurisdictionValue: string;
    selectedClaimType: ClaimType;
    customClaim: { id: BigNumber; name: string } | null;
  }) => void;
  nextAssetId: string;
}

const ClaimTypeSelector: React.FC<ClaimTypeSelectorProps> = ({
  onAddClaim,
  nextAssetId,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const [selectedClaimType, setSelectedClaimType] = useState<ClaimType | ''>(
    '',
  );
  const [scopeType, setScopeType] = useState<ExtendedScopeType>(
    ScopeType.Asset,
  );
  const [scopeValue, setScopeValue] = useState<string>('');
  const [jurisdictionValue, setJurisdictionValue] = useState<string>('');
  const [customClaim, setCustomClaim] = useState<{
    id: BigNumber;
    name: string;
  } | null>(null);
  const [scopeError, setScopeError] = useState<string>('');

  const {
    validateCustomClaim,
    createModalState,
    handleCreateModalClose,
    handleCreateModalOpen,
    handleCustomClaimCreated,
  } = useCustomClaims();

  const validateScope = async (): Promise<boolean> => {
    if (!sdk) return false;
    if (scopeType === 'None') return true;

    setScopeError('');

    // For Asset scope type
    if (scopeType === ScopeType.Asset) {
      // Empty value will use the nextAssetId which is valid
      if (!scopeValue) return true;

      // Use the nextAssetId as is (always valid since it comes from the chain)
      if (scopeValue === nextAssetId) return true;

      // Validate existing asset
      try {
        await sdk.assets.getAsset({ assetId: scopeValue });
        return true;
      } catch (error) {
        setScopeError('Asset does not exist');
        return false;
      }
    }

    // For Identity scope type
    if (scopeType === ScopeType.Identity) {
      if (!scopeValue) {
        setScopeError('Identity DID is required');
        return false;
      }

      try {
        const isValid = await sdk.identities.isIdentityValid({
          identity: scopeValue,
        });
        if (!isValid) {
          setScopeError('Identity DID does not exist');
          return false;
        }
        return true;
      } catch (error) {
        setScopeError('Invalid Identity DID');
        return false;
      }
    }

    // For Custom scope type
    if (scopeType === ScopeType.Custom && !scopeValue) {
      setScopeError('Scope value is required');
      return false;
    }

    return true;
  };

  const handleClaimTypeChange = (type: ClaimType) => {
    setSelectedClaimType(type);
    if (type !== ClaimType.Custom) {
      setCustomClaim(null);
    }
  };

  const handleScopeTypeChange = (newType: ExtendedScopeType) => {
    setScopeType(newType);
    setScopeValue('');
    setScopeError(''); // Clear error when changing scope type
  };

  const handleCustomClaimInputChange = (value: string) => {
    setCustomClaim({ id: new BigNumber(0), name: value });
  };

  const resetForm = () => {
    setSelectedClaimType('');
    setJurisdictionValue('');
    setCustomClaim(null);
    setScopeValue('');
    if (scopeType === 'None') {
      setScopeType(ScopeType.Asset);
    }
  };

  const submitClaim = (
    validCustomClaim: { id: BigNumber; name: string } | null = null,
  ) => {
    if (!selectedClaimType) {
      return;
    }
    onAddClaim({
      scopeValue,
      scopeType,
      jurisdictionValue,
      selectedClaimType,
      customClaim: validCustomClaim || customClaim,
    });

    resetForm();
  };

  const handleAdd = async () => {
    if (!selectedClaimType) return;

    // Validate scope if a scope type is selected
    if (scopeType !== 'None') {
      const isValid = await validateScope();
      if (!isValid) return;
    }

    // For custom claims, validate and potentially create
    if (selectedClaimType === ClaimType.Custom && customClaim) {
      const validClaim = await validateCustomClaim(customClaim.name);
      if (!validClaim) {
        // If it's a number ID that doesn't exist, error was already shown
        if (!Number.isNaN(Number(customClaim.name))) {
          return;
        }
        // Otherwise, show creation modal
        handleCreateModalOpen(customClaim.name, (newClaim) => {
          setCustomClaim(newClaim);
          submitClaim(newClaim);
        });
        return;
      }

      submitClaim(validClaim);
      return;
    }

    // For non-custom claims
    submitClaim();
  };

  return (
    <FieldWrapper>
      <TrustedClaimTypesContainer>
        <FieldWrapper>
          <FieldRow>
            <FieldLabel>Claim Type</FieldLabel>
            <FieldSelect
              value={selectedClaimType}
              onChange={(e) =>
                handleClaimTypeChange(e.target.value as ClaimType)
              }
            >
              <option value="">Select a claim type</option>
              {Object.values(ClaimType)
                .filter((claim) => claim !== ClaimType.CustomerDueDiligence)
                .map((claim) => (
                  <option key={claim} value={claim}>
                    {splitCamelCase(claim)}
                  </option>
                ))}
            </FieldSelect>
          </FieldRow>
        </FieldWrapper>

        {selectedClaimType === ClaimType.Jurisdiction && (
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Jurisdiction</FieldLabel>
              <FieldSelect
                value={jurisdictionValue}
                onChange={(e) => setJurisdictionValue(e.target.value)}
              >
                <option value="">Select a jurisdiction</option>
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </FieldSelect>
            </FieldRow>
          </FieldWrapper>
        )}

        {selectedClaimType === ClaimType.Custom && (
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Custom Claim</FieldLabel>
              <FieldInput
                placeholder="Enter claim ID or name"
                value={customClaim?.name || ''}
                onChange={(e) => handleCustomClaimInputChange(e.target.value)}
              />
            </FieldRow>
          </FieldWrapper>
        )}

        <FieldWrapper>
          <FieldRow>
            <FieldLabel>Scope Type</FieldLabel>
            <FieldSelect
              value={scopeType}
              onChange={(e) =>
                handleScopeTypeChange(e.target.value as ExtendedScopeType)
              }
            >
              {selectedClaimType === ClaimType.Custom && (
                <option value="None">No Scope</option>
              )}
              {Object.values(ScopeType).map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </FieldSelect>
          </FieldRow>
        </FieldWrapper>

        {scopeType !== 'None' && (
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Scope Value</FieldLabel>
              <FieldInput
                placeholder={
                  scopeType === ScopeType.Asset
                    ? nextAssetId
                    : 'Enter scope value'
                }
                value={scopeValue}
                onChange={(e) => {
                  setScopeValue(e.target.value);
                  setScopeError(''); // Clear error when input changes
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                $hasError={!!scopeError}
              />
            </FieldRow>
            {scopeError && (
              <StyledErrorMessage>{scopeError}</StyledErrorMessage>
            )}
          </FieldWrapper>
        )}

        <Button
          type="button"
          onClick={handleAdd}
          disabled={
            !selectedClaimType ||
            (selectedClaimType === ClaimType.Custom &&
              (!customClaim || !customClaim.name)) ||
            (selectedClaimType === ClaimType.Jurisdiction &&
              !jurisdictionValue) ||
            (scopeType !== 'None' &&
              scopeType !== ScopeType.Asset &&
              !scopeValue)
          }
        >
          Add Claim
        </Button>
      </TrustedClaimTypesContainer>

      {createModalState.isOpen && (
        <CreateCustomClaimModal
          customClaimName={createModalState.pendingName}
          onClose={handleCreateModalClose}
          onSuccess={handleCustomClaimCreated}
        />
      )}
    </FieldWrapper>
  );
};

export default ClaimTypeSelector;
