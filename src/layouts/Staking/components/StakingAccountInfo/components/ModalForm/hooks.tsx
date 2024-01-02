import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, ValidationMode } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  balanceToBigNumber,
  u32ToBigNumber,
} from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';
import { EModalOptions, PAYMENT_DESTINATION } from '../../constants';
import { IFieldValues, INPUT_NAMES } from './constants';
import { StakingContext } from '~/context/StakingContext';

export const useModalForm = (modalType: EModalOptions | null, max?: number) => {
  const configRef = useRef({
    mode: 'onTouched' as keyof ValidationMode,
    defaultValues: {},
  });
  const useFormReturn = useForm<IFieldValues>(configRef.current);

  const { selectedAccount } = useContext(AccountContext);
  const {
    api: { sdk, polkadotApi },
  } = useContext(PolymeshContext);

  const isValidAddress = (address: string) => {
    if (!sdk) return false;

    try {
      const isValid = sdk.accountManagement.isValidAddress({ address });
      return isValid;
    } catch (error) {
      return false;
    }
  };

  const isIdentityHasCddClaim = async (address: string) => {
    if (!sdk) return false;
    try {
      const acc = await sdk?.accountManagement.getAccount({
        address,
      });
      const identity = await acc.getIdentity();
      if (!identity) {
        return false;
      }
      const validClaim = await identity.hasValidCdd();
      return validClaim;
    } catch (_error) {
      return false;
    }
  };

  const isMultiSigSigner = async (address: string) => {
    if (!sdk) {
      return false;
    }
    try {
      const acc = await sdk?.accountManagement.getAccount({
        address,
      });
      const { relation } = await acc.getTypeInfo();
      return relation === 'MultiSigSigner';
    } catch (_error) {
      return false;
    }
  };

  const isStashAccount = async (address: string) => {
    if (!polkadotApi) return false;

    try {
      const controllerOption = await polkadotApi.query.staking.bonded(address);
      const hasController = controllerOption.isSome;
      return hasController;
    } catch (_error) {
      return false;
    }
  };

  const isControllerAccount = async (address: string) => {
    if (!polkadotApi) return false;

    try {
      const stakingLedger = await polkadotApi.query.staking.ledger(address);
      return stakingLedger.isSome;
    } catch (_error) {
      return false;
    }
  };

  const controllerValidation = yup
    .string()
    .required('Controller Address is required')
    .test(
      'is-valid-key',
      'Selected account is not a valid address',
      async (value) => {
        const isValid = isValidAddress(value);
        return isValid;
      },
    )
    .test(
      'has-valid-cdd',
      'The Controller Address should have a valid identity claim',
      async (value) => {
        const hasValidClaim = await isIdentityHasCddClaim(value);
        return hasValidClaim;
      },
    )
    .test(
      'is-multisig',
      'Controller Address can not be a MultiSigSigner',
      async (value) => {
        const isSigner = await isMultiSigSigner(value);
        return !isSigner;
      },
    )
    .test(
      'is-stash',
      'The Controller address cannot be another Stash',
      async (value) => {
        const isStash = await isStashAccount(value);
        return !isStash || value === selectedAccount;
      },
    )
    .test(
      'is-controller',
      'The Controller address cannot be a Controller of another Stash',
      async (value) => {
        const isController = await isControllerAccount(value);
        return !isController || value === selectedAccount;
      },
    );

  const amountValidation = yup
    .number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .positive('Amount must be positive')
    .test('is-decimal', 'Amount must have at most 6 decimal places', (value) =>
      value ? /^-?\d+(\.\d{1,6})?$/.test(value.toString()) : true,
    )
    .max(Number(max), 'Insufficient balance')
    .test('is-zero', 'Amount must be greater than 0', (value) => {
      const isZero = value === 0;
      return !isZero;
    });

  const specifiedAccountValidation = yup
    .string()
    .when(INPUT_NAMES.DESTINATION, {
      is: PAYMENT_DESTINATION.Account,
      then: (schema) =>
        schema
          .required('Destination Account is required')
          .test(
            'is-valid-key',
            'Selected account is not a valid address',
            async (value) => {
              const isValid = isValidAddress(value);
              return isValid;
            },
          )
          .test(
            'has-valid-cdd',
            'The Destination Address should have a valid identity claim',
            async (value) => {
              const hasValidClaim = await isIdentityHasCddClaim(value);
              return hasValidClaim;
            },
          )
          .test(
            'is-multisig',
            'Destination Address can not be a MultiSigSigner',
            async (value) => {
              const isSigner = await isMultiSigSigner(value);
              return !isSigner;
            },
          ),
      otherwise: (schema) => schema.optional().nullable(),
    });

  const configOpts = useMemo(() => {
    return {
      [EModalOptions.STAKE]: {
        mode: 'all' as keyof ValidationMode,
        defaultValues: {
          [INPUT_NAMES.CONTROLLER]: '',
          [INPUT_NAMES.AMOUNT]: 0,
          [INPUT_NAMES.NOMINATORS]: [] as string[],
          [INPUT_NAMES.DESTINATION]: '' as keyof typeof PAYMENT_DESTINATION,
          [INPUT_NAMES.SPECIFIED_ACCOUNT]: '',
        },
        resolver: yupResolver(
          yup.object().shape({
            [INPUT_NAMES.CONTROLLER]: controllerValidation,
            [INPUT_NAMES.AMOUNT]: amountValidation,
            [INPUT_NAMES.SPECIFIED_ACCOUNT]: specifiedAccountValidation,
          }),
        ),
      },
      [EModalOptions.BOND_MORE]: {
        mode: 'onTouched' as keyof ValidationMode,
        defaultValues: {
          [INPUT_NAMES.AMOUNT]: 0,
        },
        resolver: yupResolver(
          yup.object().shape({
            [INPUT_NAMES.AMOUNT]: amountValidation,
          }),
        ),
      },
      [EModalOptions.UNBOND]: {
        mode: 'onTouched' as keyof ValidationMode,
        defaultValues: {
          [INPUT_NAMES.AMOUNT]: 0,
        },
        resolver: yupResolver(
          yup.object().shape({
            [INPUT_NAMES.AMOUNT]: amountValidation,
          }),
        ),
      },
      [EModalOptions.REBOND]: {
        mode: 'onTouched' as keyof ValidationMode,
        defaultValues: {
          [INPUT_NAMES.AMOUNT]: 0,
        },
        resolver: yupResolver(
          yup.object().shape({
            [INPUT_NAMES.AMOUNT]: amountValidation,
          }),
        ),
      },
      [EModalOptions.CHANGE_CONTROLLER]: {
        mode: 'onTouched' as keyof ValidationMode,
        defaultValues: {
          [INPUT_NAMES.CONTROLLER]: '',
        },
        resolver: yupResolver(
          yup.object().shape({
            [INPUT_NAMES.CONTROLLER]: controllerValidation,
          }),
        ),
      },
      [EModalOptions.CHANGE_DESTINATION]: {
        mode: 'onTouched' as keyof ValidationMode,
        defaultValues: {
          [INPUT_NAMES.DESTINATION]: '' as keyof typeof PAYMENT_DESTINATION,
          [INPUT_NAMES.SPECIFIED_ACCOUNT]: '',
        },
        resolver: yupResolver(
          yup.object().shape({
            [INPUT_NAMES.SPECIFIED_ACCOUNT]: specifiedAccountValidation,
          }),
        ),
      },
      [EModalOptions.CHANGE_NOMINATIONS]: {
        mode: 'onTouched' as keyof ValidationMode,
        defaultValues: {
          [INPUT_NAMES.NOMINATORS]: [] as string[],
        },
      },
    };
  }, [amountValidation, controllerValidation, specifiedAccountValidation]);

  useEffect(() => {
    if (!modalType) {
      return;
    }
    configRef.current = configOpts[modalType];
  }, [configOpts, modalType, max]);

  return useFormReturn;
};

export const useOperatorRewards = () => {
  const [operatorAprRecord, setOperatorAprRecord] = useState<
    Record<string, number>
  >({});

  const {
    eraStatus: { activeEra, eraDurationTime },
    operatorInfo: { operatorsWithCommission },
  } = useContext(StakingContext);
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);

  useEffect(() => {
    if (!polkadotApi || !activeEra.index || !eraDurationTime) return;
    const previousEraIndex = activeEra.index.minus(1).toNumber();

    const MILISEONDS_PER_YEAR_BN = new BigNumber(31_536_000_000);
    const erasPerYear = MILISEONDS_PER_YEAR_BN.div(eraDurationTime);

    (async () => {
      // Fetch reward pool for the previous era
      const rewardPool =
        await polkadotApi.query.staking.erasValidatorReward(previousEraIndex);
      if (rewardPool.isNone) return;

      const totalReward = balanceToBigNumber(rewardPool.unwrap());

      // Fetch reward points for the previous era
      const previousPoints =
        await polkadotApi.query.staking.erasRewardPoints(previousEraIndex);
      const totalPoints = u32ToBigNumber(previousPoints.total);
      const operatorPoints = previousPoints.individual;

      // Fetch staking exposure data for the previous era
      const erasStakingData =
        await polkadotApi.query.staking.erasStakersClipped.entries(
          previousEraIndex,
        );
      const operatorPointsRecord: Record<string, BigNumber> = {};
      operatorPoints.forEach((points, key) => {
        operatorPointsRecord[key.toString()] = u32ToBigNumber(points);
      });
      const nodeAprRecord: Record<string, number> = {};

      Object.entries(operatorsWithCommission).forEach(
        ([operator, preferences]) => {
          const operatorPoint = operatorPointsRecord[operator];
          const nodeReward = totalReward
            .times(operatorPoint)
            .div(totalPoints)
            .decimalPlaces(6, BigNumber.ROUND_DOWN);
          const validatorPortion = nodeReward
            .times(preferences.commission.div(100))
            .decimalPlaces(6, BigNumber.ROUND_DOWN);
          const nominatorPortion = nodeReward.minus(validatorPortion);

          // Calculate rewards for nominators of the current operator
          const nodeStakingData = erasStakingData.find(
            ([key]) => key.args[1].toString() === operator,
          )?.[1];
          if (!nodeStakingData) return;

          const nodeEraReturnRate = nominatorPortion.div(
            balanceToBigNumber(nodeStakingData.total.unwrap()),
          );

          const calcedApr = nodeEraReturnRate
            .times(erasPerYear)
            .times(100)
            .decimalPlaces(3)
            .toNumber();

          nodeAprRecord[operator] = calcedApr;
        },
      );
      setOperatorAprRecord(nodeAprRecord);
    })();
  }, [activeEra.index, eraDurationTime, operatorsWithCommission, polkadotApi]);

  return operatorAprRecord;
};
