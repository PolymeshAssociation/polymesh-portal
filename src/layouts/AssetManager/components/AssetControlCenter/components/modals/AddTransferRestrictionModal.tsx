/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import {
  TransferRestriction,
  TransferRestrictionClaimCountInput,
  TransferRestrictionInputClaimPercentage,
  TransferRestrictionInputCount,
  TransferRestrictionInputPercentage,
  TransferRestrictionStatValues,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { PolymeshContext } from '~/context/PolymeshContext';
import { formatDid } from '~/helpers/formatters';
import { notifyError } from '~/helpers/notifications';
import {
  DescriptionText,
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldWrapper,
  StyledErrorMessage,
  StyledLink,
} from '../../../CreateAssetWizard/styles';
import { ModalActions, ModalContainer, ModalContent } from '../../styles';
import { filterToDecimalInput, filterToIntegerInput } from './helpers';
import {
  AddTransferRestrictionForm,
  FormClaimType,
  formDataToSdkRestriction,
} from './transferRestrictionHelpers';
import { createTransferRestrictionValidationSchema } from './validation';

interface AddTransferRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackedStats: TransferRestrictionStatValues[];
  existingRestrictions: TransferRestriction[];
  onAddRestriction: (params: {
    restrictions: (
      | TransferRestrictionInputCount
      | TransferRestrictionInputPercentage
      | TransferRestrictionClaimCountInput
      | TransferRestrictionInputClaimPercentage
    )[];
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

export const AddTransferRestrictionModal: React.FC<
  AddTransferRestrictionModalProps
> = ({
  isOpen,
  onClose,
  trackedStats,
  existingRestrictions,
  onAddRestriction,
  transactionInProcess,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const validationSchema = useMemo(
    () =>
      createTransferRestrictionValidationSchema(
        sdk,
        trackedStats,
        existingRestrictions,
      ),
    [sdk, trackedStats, existingRestrictions],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AddTransferRestrictionForm>({
    mode: 'onChange',
    defaultValues: {
      type: '',
      max: '',
      min: '',
      claimType: '',
      issuer: '',
      jurisdiction: '',
    },
    resolver: yupResolver(validationSchema),
  });

  const watchedType = watch('type');
  const watchedClaimType = watch('claimType');

  const isScoped =
    watchedType === 'ClaimCount' || watchedType === 'ClaimPercentage';
  const isPercentage =
    watchedType === 'Percentage' || watchedType === 'ClaimPercentage';

  // Determine which restriction types are available based on tracked stats
  const availableRestrictionTypes = useMemo(() => {
    const types: {
      value: 'Count' | 'Percentage' | 'ClaimCount' | 'ClaimPercentage';
      label: string;
      available: boolean;
      reason?: string;
    }[] = [
      {
        value: 'Count',
        label: 'Max Holder Count',
        available: false,
      },
      {
        value: 'Percentage',
        label: 'Max Individual Percentage Ownership',
        available: false,
      },
      {
        value: 'ClaimCount',
        label: 'Claim Holder Count',
        available: false,
      },
      {
        value: 'ClaimPercentage',
        label: 'Claim Total Percentage Ownership',
        available: false,
      },
    ];

    // Check Count - requires Count stat and not already existing
    const hasCountStat = trackedStats.some((stat) => stat.type === 'Count');
    const hasCountRestriction = existingRestrictions.some(
      (r) => r.type === 'Count',
    );
    types[0].available = hasCountStat && !hasCountRestriction;
    if (!hasCountStat) {
      types[0].reason = 'Requires "Holder Count" statistic';
    } else if (hasCountRestriction) {
      types[0].reason = 'Already configured';
    }

    // Check Percentage - requires Balance stat and not already existing
    const hasBalanceStat = trackedStats.some((stat) => stat.type === 'Balance');
    const hasPercentageRestriction = existingRestrictions.some(
      (r) => r.type === 'Percentage',
    );
    types[1].available = hasBalanceStat && !hasPercentageRestriction;
    if (!hasBalanceStat) {
      types[1].reason = 'Requires "Total Holder Balance" statistic';
    } else if (hasPercentageRestriction) {
      types[1].reason = 'Already configured';
    }

    // Check ClaimCount - requires at least one ScopedCount stat
    const hasScopedCountStat = trackedStats.some(
      (stat) => stat.type === 'ScopedCount',
    );
    types[2].available = hasScopedCountStat;
    if (!hasScopedCountStat) {
      types[2].reason = 'Requires "Claim Holder Count" statistic';
    }

    // Check ClaimPercentage - requires at least one ScopedBalance stat
    const hasScopedBalanceStat = trackedStats.some(
      (stat) => stat.type === 'ScopedBalance',
    );
    types[3].available = hasScopedBalanceStat;
    if (!hasScopedBalanceStat) {
      types[3].reason = 'Requires "Claim Holder Balance" statistic';
    }

    return types;
  }, [trackedStats, existingRestrictions]);

  const hasAvailableTypes = availableRestrictionTypes.some((t) => t.available);

  // Get available claim type + issuer combinations based on tracked stats
  const availableClaimCombinations = useMemo(() => {
    if (!isScoped) return [];

    const requiredStatType =
      watchedType === 'ClaimCount' ? 'ScopedCount' : 'ScopedBalance';

    // Get all stat combinations
    const combinations = trackedStats
      .filter((stat) => stat.type === requiredStatType && stat.claim)
      .map((stat) => {
        const claimType =
          typeof stat.claim!.claimType === 'string'
            ? stat.claim!.claimType
            : 'Custom';
        return {
          claimType,
          issuer: stat.claim!.issuer.did,
          stat,
        };
      });

    // Filter out combinations that already have restrictions
    return combinations.filter(({ claimType, issuer }) => {
      const hasRestriction = existingRestrictions.some((r) => {
        if (r.type !== watchedType) return false;
        if (r.type === 'ClaimCount' || r.type === 'ClaimPercentage') {
          const restrictionValue = r.value;
          if (restrictionValue.issuer?.did !== issuer) return false;

          const restrictionClaim = restrictionValue.claim;
          if (!restrictionClaim) return false;

          const claimKeys = Object.keys(restrictionClaim);
          const restrictionClaimType = claimKeys.find(
            (key) =>
              key === 'Jurisdiction' ||
              key === 'Accredited' ||
              key === 'Affiliate',
          );

          return restrictionClaimType === claimType;
        }
        return false;
      });

      return !hasRestriction;
    });
  }, [isScoped, watchedType, trackedStats, existingRestrictions]);

  // Get available claim types from combinations
  const availableClaimTypes = useMemo(() => {
    const claimTypes = new Set(
      availableClaimCombinations.map((c) => c.claimType),
    );
    return Array.from(claimTypes);
  }, [availableClaimCombinations]);

  // Get available issuers for the selected claim type
  const availableIssuers = useMemo(() => {
    if (!watchedClaimType) return [];

    // Extract base claim type
    let baseClaimType: string = watchedClaimType;
    if (watchedClaimType === FormClaimType.NotAccredited) {
      baseClaimType = 'Accredited';
    } else if (watchedClaimType === FormClaimType.NotAffiliate) {
      baseClaimType = 'Affiliate';
    }

    return availableClaimCombinations
      .filter((c) => c.claimType === baseClaimType)
      .map((c) => c.issuer);
  }, [watchedClaimType, availableClaimCombinations]);

  const handleClose = useCallback(() => {
    reset({
      type: '',
      max: '',
      min: '',
      claimType: '',
      issuer: '',
      jurisdiction: '',
    });
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (data: AddTransferRestrictionForm) => {
      if (!sdk) {
        notifyError('SDK not available');
        return;
      }

      try {
        // Convert form data to SDK format
        const newRestriction = await formDataToSdkRestriction(data, sdk);

        await onAddRestriction({
          restrictions: [newRestriction],
          onTransactionRunning: handleClose,
        });
      } catch (error) {
        notifyError(
          `Failed to add transfer restriction: ${(error as Error).message}`,
        );
      }
    },
    [sdk, onAddRestriction, handleClose],
  );

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="700px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={16}>
            Add Transfer Restriction
          </Heading>
          <DescriptionText>
            Add a transfer restriction to control ownership requirements based
            on investor statistics. Each restriction requires a corresponding
            tracked statistic to be enabled first. For more information, visit
            the{' '}
            <StyledLink
              href="https://developers.polymesh.network/compliance/transfer-restrictions/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Polymesh Transfer Restrictions Documentation
            </StyledLink>
            .
          </DescriptionText>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Restriction Type */}
            <FieldWrapper>
              <FieldRow>
                <FieldLabel>Restriction Type</FieldLabel>
                <FieldSelect
                  {...register('type')}
                  onChange={(e) => {
                    const value = e.target.value as
                      | 'Count'
                      | 'Percentage'
                      | 'ClaimCount'
                      | 'ClaimPercentage'
                      | '';
                    setValue('type', value);
                    setValue('claimType', '');
                    setValue('issuer', '');
                    setValue('jurisdiction', '');
                    setValue('min', '');
                    setValue('max', '');
                  }}
                  $hasError={!!errors.type}
                  disabled={!hasAvailableTypes}
                >
                  <option value="" disabled>
                    {hasAvailableTypes
                      ? 'Select restriction type'
                      : 'No restriction types available'}
                  </option>
                  {availableRestrictionTypes
                    .filter((type) => type.available)
                    .map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                </FieldSelect>
              </FieldRow>
              {errors.type && (
                <StyledErrorMessage>{errors.type.message}</StyledErrorMessage>
              )}
              {!hasAvailableTypes && (
                <Text size="small" marginTop={8}>
                  No restriction types are currently available. Enable tracked
                  statistics in the Tracked Stats section or remove existing
                  restrictions to add new ones.
                </Text>
              )}
            </FieldWrapper>

            {/* Claim Type (for scoped restrictions) */}
            {isScoped && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Claim Type</FieldLabel>
                  <FieldSelect
                    {...register('claimType')}
                    onChange={(e) => {
                      setValue('claimType', e.target.value as FormClaimType);
                      setValue('jurisdiction', '');
                      setValue('issuer', '');
                    }}
                    $hasError={!!errors.claimType}
                    disabled={availableClaimTypes.length === 0}
                  >
                    <option value="" disabled>
                      {availableClaimTypes.length === 0
                        ? 'No claim types available'
                        : 'Select claim type'}
                    </option>
                    {availableClaimTypes.includes('Accredited') && (
                      <>
                        <option value={FormClaimType.Accredited}>
                          Accredited (Present)
                        </option>
                        <option value={FormClaimType.NotAccredited}>
                          Accredited (Not Present)
                        </option>
                      </>
                    )}
                    {availableClaimTypes.includes('Affiliate') && (
                      <>
                        <option value={FormClaimType.Affiliate}>
                          Affiliate (Present)
                        </option>
                        <option value={FormClaimType.NotAffiliate}>
                          Affiliate (Not Present)
                        </option>
                      </>
                    )}
                    {availableClaimTypes.includes('Jurisdiction') && (
                      <option value={FormClaimType.Jurisdiction}>
                        Jurisdiction
                      </option>
                    )}
                  </FieldSelect>
                </FieldRow>
                {errors.claimType && (
                  <StyledErrorMessage>
                    {errors.claimType.message}
                  </StyledErrorMessage>
                )}
                {availableClaimTypes.length === 0 && (
                  <Text size="small" marginTop={8}>
                    All available claim combinations for this restriction type
                    have been configured or no tracked statistics are enabled.
                  </Text>
                )}
              </FieldWrapper>
            )}

            {/* Jurisdiction (for Jurisdiction claim type) */}
            {isScoped && watchedClaimType === FormClaimType.Jurisdiction && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Jurisdiction</FieldLabel>
                  <FieldSelect
                    {...register('jurisdiction')}
                    $hasError={!!errors.jurisdiction}
                  >
                    <option value="" disabled>
                      Select jurisdiction
                    </option>
                    <option value="NONE">No Jurisdiction</option>
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </FieldSelect>
                </FieldRow>
                {errors.jurisdiction && (
                  <StyledErrorMessage>
                    {errors.jurisdiction.message}
                  </StyledErrorMessage>
                )}
              </FieldWrapper>
            )}

            {/* Claim Issuer DID (for scoped restrictions) */}
            {isScoped && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Claim Issuer DID</FieldLabel>
                  <FieldSelect
                    {...register('issuer')}
                    $hasError={!!errors.issuer}
                  >
                    <option value="" disabled>
                      Select claim issuer
                    </option>
                    {availableIssuers.map((did) => (
                      <option key={did} value={did}>
                        {formatDid(did, 10, 10)}
                      </option>
                    ))}
                  </FieldSelect>
                </FieldRow>
                {errors.issuer && (
                  <StyledErrorMessage>
                    {errors.issuer.message}
                  </StyledErrorMessage>
                )}
                {watchedClaimType && availableIssuers.length === 0 && (
                  <Text size="small" marginTop={8}>
                    No available issuers found for this claim type.
                  </Text>
                )}
              </FieldWrapper>
            )}

            {/* Min Value (for scoped restrictions) */}
            {isScoped && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>
                    Minimum {isPercentage ? 'Percentage' : 'Count'}
                  </FieldLabel>
                  <FieldInput
                    type="text"
                    placeholder={`Enter minimum ${isPercentage ? 'percentage' : 'count'} (optional)`}
                    {...register('min')}
                    onInput={
                      isPercentage ? filterToDecimalInput : filterToIntegerInput
                    }
                    $hasError={!!errors.min}
                  />
                </FieldRow>
                {errors.min && (
                  <StyledErrorMessage>{errors.min.message}</StyledErrorMessage>
                )}
                <Text size="small" marginTop={8}>
                  Optional: Set a minimum value. If not provided, defaults to 0.
                </Text>
              </FieldWrapper>
            )}

            {/* Max Value */}
            {watchedType && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>
                    Maximum {isPercentage ? 'Percentage' : 'Count'}
                  </FieldLabel>
                  <FieldInput
                    type="text"
                    placeholder={`Enter maximum ${isPercentage ? 'percentage (0-100)' : 'count'}`}
                    {...register('max')}
                    onInput={
                      isPercentage ? filterToDecimalInput : filterToIntegerInput
                    }
                    $hasError={!!errors.max}
                  />
                </FieldRow>
                {errors.max && (
                  <StyledErrorMessage>{errors.max.message}</StyledErrorMessage>
                )}
              </FieldWrapper>
            )}

            <ModalActions>
              <Button
                variant="modalSecondary"
                onClick={handleClose}
                disabled={transactionInProcess}
              >
                Cancel
              </Button>
              <Button
                variant="modalPrimary"
                onClick={handleSubmit(onSubmit)}
                disabled={transactionInProcess}
              >
                Add Restriction
              </Button>
            </ModalActions>
          </form>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
