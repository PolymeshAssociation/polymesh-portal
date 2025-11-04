/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  AddBalanceStatParams,
  AddClaimBalanceStatParams,
  AddClaimCountStatParams,
  AddCountStatParams,
  ClaimType,
  CountryCode,
  StatType,
  TransferRestrictionStatValues,
  TrustedFor,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon, Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { notifyError } from '~/helpers/notifications';
import {
  FieldInput,
  FieldInputWithButton,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldWrapper,
  IconWrapper,
  StyledErrorMessage,
  StyledLink,
} from '../../../CreateAssetWizard/styles';
import { ModalActions, ModalContainer, ModalContent } from '../../styles';
import {
  buildScopedClaimValue,
  filterToDecimalInput,
  filterToIntegerInput,
} from './helpers';
import { createEditStatValidationSchema } from './validation';

interface IEditTrackedStatForm {
  // For Count stats
  count?: string;
  // For Balance stats
  balance?: string;
  // For Accredited/Affiliate scoped stats
  withClaim?: string;
  withoutClaim?: string;
  // For Jurisdiction scoped stats - dynamic fields
  [key: string]: string | undefined;
}

interface IEditTrackedStatModalProps {
  isOpen: boolean;
  onClose: () => void;
  statToEdit: TransferRestrictionStatValues | null;
  onEditStat: (params: {
    stat:
      | AddCountStatParams
      | AddBalanceStatParams
      | AddClaimCountStatParams
      | AddClaimBalanceStatParams;
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

export const EditTrackedStatModal: React.FC<IEditTrackedStatModalProps> = ({
  isOpen,
  onClose,
  statToEdit,
  onEditStat,
  transactionInProcess,
}) => {
  const countryLookup = useMemo(
    () => new Map(countryCodes.map((c) => [c.code, c.name])),
    [],
  );

  const [selectedJurisdictions, setSelectedJurisdictions] = useState<
    (CountryCode | 'NONE')[]
  >([]);

  const validationSchema = useMemo(
    () => createEditStatValidationSchema(statToEdit, selectedJurisdictions),
    [statToEdit, selectedJurisdictions],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<IEditTrackedStatForm>({
    mode: 'onChange',
    defaultValues: {},
    resolver: yupResolver(validationSchema),
  });

  // Load current values when modal opens
  useEffect(() => {
    if (isOpen && statToEdit) {
      const defaultValues: IEditTrackedStatForm = {};

      if (statToEdit.type === 'Count') {
        defaultValues.count = statToEdit.value.toString();
      } else if (statToEdit.type === 'Balance') {
        defaultValues.balance = statToEdit.value.toString();
      } else if (statToEdit.claim) {
        const claimValue = statToEdit.claim.value;
        if (
          statToEdit.claim.claimType === ClaimType.Jurisdiction &&
          Array.isArray(claimValue)
        ) {
          // Filter out zero-value jurisdictions and initialize selected jurisdictions
          const nonZeroJurisdictions = claimValue.filter(
            (jv) => jv.value && !jv.value.isZero(),
          );
          const jurisdictions = nonZeroJurisdictions.map((jv) => {
            const code = jv.countryCode;
            return code ? (code as CountryCode) : ('NONE' as const);
          });
          setSelectedJurisdictions(jurisdictions);

          nonZeroJurisdictions.forEach((jv) => {
            const code = jv.countryCode;
            const jurisdictionCode = code || 'NONE';

            const fieldName = `jurisdiction_${jurisdictionCode}`;
            defaultValues[fieldName] = jv.value.toString();
          });
        } else if (claimValue && !Array.isArray(claimValue)) {
          // Accredited/Affiliate
          defaultValues.withClaim = claimValue.withClaim.toString();
          defaultValues.withoutClaim = claimValue.withoutClaim.toString();
        }
      }

      reset(defaultValues);
    } else if (!isOpen) {
      // Reset selected jurisdictions when modal closes
      setSelectedJurisdictions([]);
    }
  }, [isOpen, statToEdit, reset]);

  const handleClose = () => {
    reset({});
    onClose();
  };

  const onSubmit = async (data: IEditTrackedStatForm) => {
    if (!statToEdit) return;
    try {
      let stat:
        | AddCountStatParams
        | AddBalanceStatParams
        | AddClaimCountStatParams
        | AddClaimBalanceStatParams;

      // Build proper stat object based on type
      if (statToEdit.type === 'Count') {
        stat = {
          type: StatType.Count,
          count: new BigNumber(data.count!),
        };
      } else if (statToEdit.type === 'Balance') {
        stat = {
          type: StatType.Balance,
          balance: new BigNumber(data.balance!),
        };
      } else if (statToEdit.claim) {
        const { issuer, claimType } = statToEdit.claim;

        if (claimType === ClaimType.Accredited) {
          stat = {
            type: statToEdit.type,
            issuer,
            claimType: ClaimType.Accredited,
            value: buildScopedClaimValue(
              ClaimType.Accredited,
              data.withClaim,
              data.withoutClaim,
            ),
          } as AddClaimCountStatParams | AddClaimBalanceStatParams;
        } else if (claimType === ClaimType.Affiliate) {
          stat = {
            type: statToEdit.type,
            issuer,
            claimType: ClaimType.Affiliate,
            value: buildScopedClaimValue(
              ClaimType.Affiliate,
              data.withClaim,
              data.withoutClaim,
            ),
          } as AddClaimCountStatParams | AddClaimBalanceStatParams;
        } else if (claimType === ClaimType.Jurisdiction) {
          const jurisdictions = selectedJurisdictions.map((code) => {
            const fieldName = `jurisdiction_${code}`;
            const value = new BigNumber(data[fieldName]!);
            return {
              countryCode: code === 'NONE' ? undefined : (code as CountryCode),
              [statToEdit.type === 'ScopedCount' ? 'count' : 'balance']: value,
            };
          });

          stat = {
            type: statToEdit.type,
            issuer,
            claimType: ClaimType.Jurisdiction,
            value: jurisdictions,
          } as AddClaimCountStatParams | AddClaimBalanceStatParams;
        } else {
          return;
        }
      } else {
        return;
      }

      await onEditStat({ stat, onTransactionRunning: handleClose });
    } catch (error) {
      // Handle any unexpected errors during stat construction or submission
      notifyError(
        'Failed to edit tracked statistic. Please verify your data and try again.',
      );
    }
  };

  if (!isOpen || !statToEdit) return null;

  // Helper to get stat type display name
  const getStatTypeLabel = () => {
    if (statToEdit.type === 'Count') return 'Holder Count';
    if (statToEdit.type === 'Balance') return 'Holder Balance';
    if (statToEdit.type === 'ScopedCount') return 'Holder Count with Claim';
    if (statToEdit.type === 'ScopedBalance') return 'Holder Balance with Claim';
    return 'Unknown';
  };

  // Helper to format claim type for display
  const formatClaimType = (claimType: TrustedFor) => {
    if (typeof claimType === 'string') {
      return claimType.charAt(0).toUpperCase() + claimType.slice(1);
    }
    return 'Custom';
  };

  return (
    <Modal handleClose={handleClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={16}>
            Edit Tracked Stat
          </Heading>
          <Text marginBottom={16}>
            Update the current values for this statistic. These values should
            reflect the actual holder counts or balances. For more information,
            visit the{' '}
            <StyledLink
              href="https://developers.polymesh.network/compliance/transfer-restrictions/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Polymesh Transfer Restrictions Documentation
            </StyledLink>
            .
          </Text>
          <Text marginBottom={24}>
            <strong>Important:</strong> For actively traded assets, it is
            recommended to freeze transfers before updating statistic values.
            Ongoing transfers may change values during the update process,
            potentially causing inconsistencies.
          </Text>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldWrapper>
              <FieldRow>
                <FieldLabel>Stat Type</FieldLabel>
                <FieldInput type="text" value={getStatTypeLabel()} disabled />
              </FieldRow>
            </FieldWrapper>

            {statToEdit.claim && (
              <>
                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel>Claim Type</FieldLabel>
                    <FieldInput
                      type="text"
                      value={formatClaimType(statToEdit.claim.claimType)}
                      disabled
                    />
                  </FieldRow>
                </FieldWrapper>

                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel>Claim Issuer</FieldLabel>
                    <FieldInput
                      type="text"
                      value={statToEdit.claim.issuer.did}
                      disabled
                    />
                  </FieldRow>
                </FieldWrapper>
              </>
            )}

            {/* Count stat */}
            {statToEdit.type === 'Count' && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Current Holder Count</FieldLabel>
                  <FieldInput
                    type="text"
                    placeholder="Enter current holder count"
                    {...register('count')}
                    onInput={filterToIntegerInput}
                    $hasError={!!errors.count}
                  />
                </FieldRow>
                {errors.count && (
                  <StyledErrorMessage>
                    {errors.count.message}
                  </StyledErrorMessage>
                )}
              </FieldWrapper>
            )}

            {/* Balance stat */}
            {statToEdit.type === 'Balance' && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Current Holder Balance</FieldLabel>
                  <FieldInput
                    type="text"
                    placeholder="Enter current holder balance"
                    {...register('balance')}
                    onInput={filterToDecimalInput}
                    $hasError={!!errors.balance}
                  />
                </FieldRow>
                {errors.balance && (
                  <StyledErrorMessage>
                    {errors.balance.message}
                  </StyledErrorMessage>
                )}
              </FieldWrapper>
            )}

            {/* Accredited/Affiliate scoped stats */}
            {statToEdit.claim &&
              (statToEdit.claim.claimType === ClaimType.Accredited ||
                statToEdit.claim.claimType === ClaimType.Affiliate) && (
                <>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel>
                        {statToEdit.type === 'ScopedCount'
                          ? 'Count With Claim'
                          : 'Balance With Claim'}
                      </FieldLabel>
                      <FieldInput
                        type="text"
                        placeholder={
                          statToEdit.type === 'ScopedCount'
                            ? 'Enter count with claim'
                            : 'Enter balance with claim'
                        }
                        {...register('withClaim')}
                        onInput={
                          statToEdit.type === 'ScopedCount'
                            ? filterToIntegerInput
                            : filterToDecimalInput
                        }
                        $hasError={!!errors.withClaim}
                      />
                    </FieldRow>
                    {errors.withClaim && (
                      <StyledErrorMessage>
                        {errors.withClaim.message}
                      </StyledErrorMessage>
                    )}
                  </FieldWrapper>

                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel>
                        {statToEdit.type === 'ScopedCount'
                          ? 'Count Without Claim'
                          : 'Balance Without Claim'}
                      </FieldLabel>
                      <FieldInput
                        type="text"
                        placeholder={
                          statToEdit.type === 'ScopedCount'
                            ? 'Enter count without claim'
                            : 'Enter balance without claim'
                        }
                        {...register('withoutClaim')}
                        onInput={
                          statToEdit.type === 'ScopedCount'
                            ? filterToIntegerInput
                            : filterToDecimalInput
                        }
                        $hasError={!!errors.withoutClaim}
                      />
                    </FieldRow>
                    {errors.withoutClaim && (
                      <StyledErrorMessage>
                        {errors.withoutClaim.message}
                      </StyledErrorMessage>
                    )}
                  </FieldWrapper>
                </>
              )}

            {/* Jurisdiction scoped stats */}
            {statToEdit.claim &&
              statToEdit.claim.claimType === ClaimType.Jurisdiction && (
                <>
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel>Add Jurisdiction</FieldLabel>
                      <FieldSelect
                        value=""
                        onChange={(e) => {
                          const value = e.target.value as CountryCode | 'NONE';
                          if (value && !selectedJurisdictions.includes(value)) {
                            setSelectedJurisdictions([
                              ...selectedJurisdictions,
                              value,
                            ]);
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">Select jurisdiction to add</option>
                        <option value="NONE">No Jurisdiction</option>
                        {countryCodes.map((country) => (
                          <option
                            key={country.code}
                            value={country.code}
                            disabled={selectedJurisdictions.includes(
                              country.code as CountryCode,
                            )}
                          >
                            {country.name}
                          </option>
                        ))}
                      </FieldSelect>
                    </FieldRow>
                    <Text size="small" marginTop={8}>
                      Add jurisdictions to track or modify. Items removed using
                      the delete button will keep their current value. To clear
                      a jurisdiction, set its value to 0.
                    </Text>
                  </FieldWrapper>

                  {selectedJurisdictions.map((code) => {
                    const fieldName = `jurisdiction_${code}`;
                    const error = errors[fieldName];
                    const displayName =
                      code === 'NONE'
                        ? 'No Jurisdiction'
                        : countryLookup.get(code) || code;

                    return (
                      <FieldWrapper key={code}>
                        <FieldRow>
                          <FieldLabel>{displayName}</FieldLabel>
                          <FieldInputWithButton>
                            <FieldInput
                              type="text"
                              placeholder={`Enter ${statToEdit.type === 'ScopedCount' ? 'count' : 'balance'}`}
                              {...register(fieldName)}
                              onInput={
                                statToEdit.type === 'ScopedCount'
                                  ? filterToIntegerInput
                                  : filterToDecimalInput
                              }
                              $hasError={!!error}
                            />
                            <IconWrapper
                              onClick={() => {
                                setSelectedJurisdictions(
                                  selectedJurisdictions.filter(
                                    (c) => c !== code,
                                  ),
                                );
                                setValue(fieldName, '');
                              }}
                              title="Remove this jurisdiction from the update"
                            >
                              <Icon name="Delete" size="20px" />
                            </IconWrapper>
                          </FieldInputWithButton>
                        </FieldRow>
                        {error && (
                          <StyledErrorMessage>
                            {error.message as string}
                          </StyledErrorMessage>
                        )}
                      </FieldWrapper>
                    );
                  })}
                </>
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
                Update Stat
              </Button>
            </ModalActions>
          </form>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
