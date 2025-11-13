/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { Identity } from '@polymeshassociation/polymesh-sdk/internal';
import {
  AddBalanceStatParams,
  AddClaimBalanceStatParams,
  AddClaimCountStatParams,
  AddCountStatParams,
  ClaimType,
  CountryCode,
  StatType,
  TransferRestrictionStatValues,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Icon, Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { PolymeshContext } from '~/context/PolymeshContext';
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
import { createAddStatValidationSchema } from './validation';

export interface IAddTrackedStatForm {
  type: StatType | '';
  claimType?: ClaimType | '';
  issuer?: string;
  // For Count stats
  count?: string;
  // For Balance stats
  balance?: string;
  // For Accredited/Affiliate scoped stats
  withClaim?: string;
  withoutClaim?: string;
  // For Jurisdiction scoped stats - dynamic fields by country code
  [key: string]: string | undefined;
}

interface IAddTrackedStatModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackedStats: TransferRestrictionStatValues[];
  onAddStat: (params: {
    stat:
      | AddCountStatParams
      | AddBalanceStatParams
      | AddClaimCountStatParams
      | AddClaimBalanceStatParams;
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

export const AddTrackedStatModal: React.FC<IAddTrackedStatModalProps> = ({
  isOpen,
  onClose,
  trackedStats,
  onAddStat,
  transactionInProcess,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const countryLookup = useMemo(
    () => new Map(countryCodes.map((c) => [c.code, c.name])),
    [],
  );

  const validationSchema = useMemo(
    () => createAddStatValidationSchema(sdk, trackedStats),
    [sdk, trackedStats],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<IAddTrackedStatForm>({
    mode: 'onChange',
    defaultValues: {
      type: '',
      claimType: '',
      issuer: '',
      withClaim: '',
      withoutClaim: '',
    },
    resolver: yupResolver(validationSchema),
  });

  const watchedType = watch('type');
  const watchedClaimType = watch('claimType');
  const [selectedJurisdictions, setSelectedJurisdictions] = React.useState<
    (CountryCode | 'NONE')[]
  >([]);

  const isScoped =
    watchedType === StatType.ScopedCount ||
    watchedType === StatType.ScopedBalance;

  // Available stat types (exclude existing non-scoped stats)
  const availableStatTypes = useMemo(() => {
    const existingTypes = new Set<StatType>();
    trackedStats.forEach((stat) => {
      // Only track non-scoped types (scoped types can have multiple with different scopes)
      if (
        stat.type !== StatType.ScopedCount &&
        stat.type !== StatType.ScopedBalance
      ) {
        existingTypes.add(stat.type);
      }
    });

    // Filter out existing non-scoped types
    return Object.values(StatType).filter((type) => {
      // If it's a scoped type, allow it (can have multiple with different claims)
      if (type === StatType.ScopedCount || type === StatType.ScopedBalance) {
        return true;
      }
      // For non-scoped types, exclude if already exists
      return !existingTypes.has(type);
    });
  }, [trackedStats]);

  const handleClose = () => {
    reset({
      type: '',
      claimType: '',
      issuer: '',
      withClaim: '',
      withoutClaim: '',
    });
    setSelectedJurisdictions([]);
    onClose();
  };

  // Helper to get stat type display name
  const getStatTypeLabel = (type: StatType) => {
    if (type === StatType.Count) return 'Holder Count';
    if (type === StatType.Balance) return 'Total Holder Balance';
    if (type === StatType.ScopedCount) return 'Claim Holder Count';
    if (type === StatType.ScopedBalance) return 'Claim Holder Balance';
    return type;
  };

  const onSubmit = async (data: IAddTrackedStatForm) => {
    if (!data.type || !sdk) return;

    try {
      let stat:
        | AddCountStatParams
        | AddBalanceStatParams
        | AddClaimCountStatParams
        | AddClaimBalanceStatParams;

      // Build the appropriate stat object based on type
      if (data.type === StatType.Count) {
        stat = {
          type: StatType.Count,
          count: data.count ? new BigNumber(data.count) : undefined,
        };
      } else if (data.type === StatType.Balance) {
        stat = {
          type: StatType.Balance,
          balance: data.balance ? new BigNumber(data.balance) : undefined,
        };
      } else if (
        data.type === StatType.ScopedCount &&
        data.issuer &&
        data.claimType
      ) {
        let issuer: Identity;
        try {
          issuer = await sdk.identities.getIdentity({ did: data.issuer });
        } catch (error) {
          // Failed to retrieve identity - could be non-existent DID or network error
          notifyError(
            'Failed to validate claim issuer DID. Please verify the DID is correct and try again.',
          );
          return;
        }
        if (data.claimType === ClaimType.Accredited) {
          stat = {
            type: StatType.ScopedCount,
            issuer,
            claimType: ClaimType.Accredited,
            value: buildScopedClaimValue(
              ClaimType.Accredited,
              data.withClaim,
              data.withoutClaim,
            ),
          };
        } else if (data.claimType === ClaimType.Affiliate) {
          stat = {
            type: StatType.ScopedCount,
            issuer,
            claimType: ClaimType.Affiliate,
            value: buildScopedClaimValue(
              ClaimType.Affiliate,
              data.withClaim,
              data.withoutClaim,
            ),
          };
        } else if (data.claimType === ClaimType.Jurisdiction) {
          // Build jurisdiction values from selected jurisdictions
          const jurisdictionValues = selectedJurisdictions
            .map((code) => {
              const fieldName = `jurisdiction_count_${code}`;
              const value = data[fieldName];
              if (!value) return null;
              return {
                countryCode:
                  code === 'NONE' ? undefined : (code as CountryCode),
                count: new BigNumber(value),
              };
            })
            .filter((v) => v !== null) as {
            countryCode: CountryCode | undefined;
            count: BigNumber;
          }[];

          stat = {
            type: StatType.ScopedCount,
            issuer,
            claimType: ClaimType.Jurisdiction,
            value:
              jurisdictionValues.length > 0 ? jurisdictionValues : undefined,
          };
        } else {
          return;
        }
      } else if (
        data.type === StatType.ScopedBalance &&
        data.issuer &&
        data.claimType
      ) {
        let issuer: Identity;
        try {
          issuer = await sdk.identities.getIdentity({ did: data.issuer });
        } catch (error) {
          // Failed to retrieve identity - could be non-existent DID or network error
          notifyError(
            'Failed to validate claim issuer DID. Please verify the DID is correct and try again.',
          );
          return;
        }
        if (data.claimType === ClaimType.Accredited) {
          stat = {
            type: StatType.ScopedBalance,
            issuer,
            claimType: ClaimType.Accredited,
            value: buildScopedClaimValue(
              ClaimType.Accredited,
              data.withClaim,
              data.withoutClaim,
            ),
          };
        } else if (data.claimType === ClaimType.Affiliate) {
          stat = {
            type: StatType.ScopedBalance,
            issuer,
            claimType: ClaimType.Affiliate,
            value: buildScopedClaimValue(
              ClaimType.Affiliate,
              data.withClaim,
              data.withoutClaim,
            ),
          };
        } else if (data.claimType === ClaimType.Jurisdiction) {
          // Build jurisdiction values from selected jurisdictions
          const jurisdictionValues = selectedJurisdictions
            .map((code) => {
              const fieldName = `jurisdiction_balance_${code}`;
              const value = data[fieldName];
              if (!value) return null;
              return {
                countryCode:
                  code === 'NONE' ? undefined : (code as CountryCode),
                balance: new BigNumber(value),
              };
            })
            .filter((v) => v !== null) as {
            countryCode: CountryCode | undefined;
            balance: BigNumber;
          }[];

          stat = {
            type: StatType.ScopedBalance,
            issuer,
            claimType: ClaimType.Jurisdiction,
            value:
              jurisdictionValues.length > 0 ? jurisdictionValues : undefined,
          };
        } else {
          return;
        }
      } else {
        return;
      }

      await onAddStat({ stat, onTransactionRunning: handleClose });
    } catch (error) {
      // Handle any unexpected errors during stat construction or submission
      notifyError(
        'Failed to add tracked statistic. Please verify your data and try again.',
      );
    }
  };

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={16}>
            Add Tracked Statistic
          </Heading>
          <Text marginBottom={16}>
            Tracked statistics are required before setting transfer
            restrictions. Select the type of statistic to track for this asset.
            For more information, visit the{' '}
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
            recommended to freeze transfers before enabling a new statistic.
            Ongoing transfers may alter values during the initialization
            process, potentially causing inconsistencies.
          </Text>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldWrapper>
              <FieldRow>
                <FieldLabel>Stat Type</FieldLabel>
                <FieldSelect
                  {...register('type')}
                  onChange={(e) => {
                    reset({
                      type: e.target.value as StatType,
                      claimType: '',
                      issuer: '',
                      withClaim: '',
                      withoutClaim: '',
                    });
                    setSelectedJurisdictions([]);
                  }}
                  $hasError={!!errors.type}
                >
                  <option value="" disabled>
                    Select a stat type
                  </option>
                  {availableStatTypes.map((type) => (
                    <option key={type} value={type}>
                      {getStatTypeLabel(type)}
                    </option>
                  ))}
                </FieldSelect>
              </FieldRow>
              {errors.type && (
                <StyledErrorMessage>{errors.type.message}</StyledErrorMessage>
              )}
            </FieldWrapper>

            {watchedType === StatType.Count && (
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
                <Text size="small" marginTop={8}>
                  Optional: Specify the current number of unique holders for
                  this asset. If not provided, defaults to 0. The counter will
                  update automatically with future transfers.
                </Text>
              </FieldWrapper>
            )}

            {watchedType === StatType.Balance && (
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Initial Total Balance</FieldLabel>
                  <FieldInput
                    type="text"
                    placeholder="Enter initial total balance (optional)"
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
                <Text size="small" marginTop={8}>
                  Optional: Initialize the total holder balance. If not
                  provided, defaults to 0. The balance will update automatically
                  with future transfers.
                </Text>
              </FieldWrapper>
            )}

            {isScoped && (
              <>
                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel>Claim Type</FieldLabel>
                    <FieldSelect
                      {...register('claimType')}
                      onChange={(e) => {
                        setValue('claimType', e.target.value as ClaimType);
                        if (e.target.value !== 'Jurisdiction') {
                          setSelectedJurisdictions([]);
                        } else {
                          setValue('withClaim', '');
                          setValue('withoutClaim', '');
                        }
                      }}
                      $hasError={!!errors.claimType}
                    >
                      <option value="">Select claim type</option>
                      <option value={ClaimType.Accredited}>Accredited</option>
                      <option value={ClaimType.Affiliate}>Affiliate</option>
                      <option value={ClaimType.Jurisdiction}>
                        Jurisdiction
                      </option>
                    </FieldSelect>
                  </FieldRow>
                  {errors.claimType && (
                    <StyledErrorMessage>
                      {errors.claimType.message}
                    </StyledErrorMessage>
                  )}
                </FieldWrapper>

                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel>Claim Issuer DID</FieldLabel>
                    <FieldInput
                      type="text"
                      placeholder="Enter claim issuer DID (0x...)"
                      {...register('issuer')}
                      $hasError={!!errors.issuer}
                    />
                  </FieldRow>
                  {errors.issuer && (
                    <StyledErrorMessage>
                      {errors.issuer.message}
                    </StyledErrorMessage>
                  )}
                </FieldWrapper>

                {watchedClaimType === ClaimType.Jurisdiction && (
                  <>
                    <FieldWrapper>
                      <FieldRow>
                        <FieldLabel>Add Jurisdiction</FieldLabel>
                        <FieldSelect
                          value=""
                          onChange={(e) => {
                            const value = e.target.value as
                              | CountryCode
                              | 'NONE';
                            if (
                              value &&
                              !selectedJurisdictions.includes(value)
                            ) {
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
                        Select one or more jurisdictions to initialize. Values
                        for unselected jurisdictions will default to 0.
                      </Text>
                    </FieldWrapper>

                    {selectedJurisdictions.map((code) => {
                      const fieldName =
                        watchedType === StatType.ScopedCount
                          ? `jurisdiction_count_${code}`
                          : `jurisdiction_balance_${code}`;
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
                                placeholder={`Enter ${watchedType === StatType.ScopedCount ? 'count' : 'balance'} (optional)`}
                                {...register(fieldName)}
                                onInput={
                                  watchedType === StatType.ScopedCount
                                    ? filterToIntegerInput
                                    : filterToDecimalInput
                                }
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
                              >
                                <Icon name="Delete" size="20px" />
                              </IconWrapper>
                            </FieldInputWithButton>
                          </FieldRow>
                        </FieldWrapper>
                      );
                    })}
                  </>
                )}

                {(watchedClaimType === ClaimType.Accredited ||
                  watchedClaimType === ClaimType.Affiliate) && (
                  <>
                    <FieldWrapper>
                      <FieldRow>
                        <FieldLabel>
                          {watchedClaimType === ClaimType.Accredited
                            ? 'Accredited'
                            : 'Affiliate'}{' '}
                          {watchedType === StatType.ScopedCount
                            ? 'Count'
                            : 'Balance'}
                        </FieldLabel>
                        <FieldInput
                          type="text"
                          placeholder={`Enter ${watchedType === StatType.ScopedCount ? 'count' : 'balance'} with ${watchedClaimType === ClaimType.Accredited ? 'accredited' : 'affiliate'} claim (optional)`}
                          {...register('withClaim')}
                          onInput={
                            watchedType === StatType.ScopedCount
                              ? filterToIntegerInput
                              : filterToDecimalInput
                          }
                        />
                      </FieldRow>
                      <Text size="small" marginTop={8}>
                        Optional:{' '}
                        {watchedType === StatType.ScopedCount
                          ? 'Number of holders'
                          : 'Total balance of holders'}{' '}
                        with{' '}
                        {watchedClaimType === ClaimType.Accredited
                          ? 'accredited'
                          : 'affiliate'}{' '}
                        claim. Defaults to 0.
                      </Text>
                    </FieldWrapper>
                    <FieldWrapper>
                      <FieldRow>
                        <FieldLabel>
                          Non-
                          {watchedClaimType === ClaimType.Accredited
                            ? 'Accredited'
                            : 'Affiliate'}{' '}
                          {watchedType === StatType.ScopedCount
                            ? 'Count'
                            : 'Balance'}
                        </FieldLabel>
                        <FieldInput
                          type="text"
                          placeholder={`Enter ${watchedType === StatType.ScopedCount ? 'count' : 'balance'} without ${watchedClaimType === ClaimType.Accredited ? 'accredited' : 'affiliate'} claim (optional)`}
                          {...register('withoutClaim')}
                          onInput={
                            watchedType === StatType.ScopedCount
                              ? filterToIntegerInput
                              : filterToDecimalInput
                          }
                        />
                      </FieldRow>
                      <Text size="small" marginTop={8}>
                        Optional:{' '}
                        {watchedType === StatType.ScopedCount
                          ? 'Number of holders'
                          : 'Total balance of holders'}{' '}
                        without{' '}
                        {watchedClaimType === ClaimType.Accredited
                          ? 'accredited'
                          : 'affiliate'}{' '}
                        claim. Defaults to 0.
                      </Text>
                    </FieldWrapper>
                  </>
                )}
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
                Add Stat
              </Button>
            </ModalActions>
          </form>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
