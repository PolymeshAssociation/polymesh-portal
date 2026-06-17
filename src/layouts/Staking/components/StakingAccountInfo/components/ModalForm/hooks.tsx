import { yupResolver } from '@hookform/resolvers/yup';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  balanceToBigNumber,
  u32ToBigNumber,
} from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { useContext, useEffect, useRef, useState } from 'react';
import { Resolver, useForm, ValidationMode } from 'react-hook-form';
import * as yup from 'yup';
import { PolymeshContext } from '~/context/PolymeshContext';
import { StakingContext } from '~/context/StakingContext';
import { EModalOptions, PAYMENT_DESTINATION } from '../../constants';
import { IFieldValues, INPUT_NAMES } from './constants';

export const useModalForm = (modalType: EModalOptions | null, max?: number) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const sdkRef = useRef(sdk);
  sdkRef.current = sdk;

  const maxRef = useRef(max);
  maxRef.current = max;

  // Lazily build and cache the form config on the first render only.
  const formConfigRef = useRef<{
    mode: keyof ValidationMode;
    defaultValues?: Partial<IFieldValues>;
    resolver?: Resolver<IFieldValues>;
  } | null>(null);

  if (formConfigRef.current === null && modalType) {
    const isValidAddress = (address: string) => {
      const currentSdk = sdkRef.current;
      if (!currentSdk) return false;
      try {
        return currentSdk.accountManagement.isValidAddress({ address });
      } catch {
        return false;
      }
    };

    const amountValidation = yup
      .number()
      .typeError('Amount must be a number')
      .required('Amount is required')
      .positive('Amount must be positive')
      .test(
        'is-decimal',
        'Amount must have at most 6 decimal places',
        (value) =>
          value ? /^-?\d+(\.\d{1,6})?$/.test(value.toString()) : true,
      )
      .test('max-balance', 'Insufficient balance', (value) => {
        if (value == null || maxRef.current == null) return true;
        return value <= maxRef.current;
      })
      .test('is-zero', 'Amount must be greater than 0', (value) => value !== 0);

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
              (value) => isValidAddress(value ?? ''),
            ),
        otherwise: (schema) => schema.optional().nullable(),
      });

    const configs: Partial<
      Record<
        EModalOptions,
        {
          mode: keyof ValidationMode;
          defaultValues?: Partial<IFieldValues>;
          resolver?: Resolver<IFieldValues>;
        }
      >
    > = {
      [EModalOptions.STAKE]: {
        mode: 'all' as keyof ValidationMode,
        defaultValues: {
          [INPUT_NAMES.AMOUNT]: 0,
          [INPUT_NAMES.NOMINATORS]: [] as string[],
          [INPUT_NAMES.DESTINATION]:
            PAYMENT_DESTINATION.Staked as keyof typeof PAYMENT_DESTINATION,
          [INPUT_NAMES.SPECIFIED_ACCOUNT]: '',
        },
        resolver: yupResolver(
          yup.object().shape({
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

    const config = configs[modalType];
    if (config) {
      formConfigRef.current = config;
    }
  }

  const useFormReturn = useForm<IFieldValues>(
    formConfigRef.current ?? { mode: 'onTouched', defaultValues: {} },
  );

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

    const MILLISECONDS_PER_YEAR_BN = new BigNumber(31_536_000_000);
    const erasPerYear = MILLISECONDS_PER_YEAR_BN.div(eraDurationTime);

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
