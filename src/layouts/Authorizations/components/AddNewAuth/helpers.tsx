import {
  AuthorizationType,
  PermissionGroupType,
} from '@polymeshassociation/polymesh-sdk/types';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTransferPolyx } from '~/hooks/polymesh';

const INPUT_NAMES = {
  TARGET: 'target',
  TARGET_ACCOUNT: 'targetAccount',
  TARGET_IDENTITY: 'targetIdentity',
  EXPIRY: 'expiry',
  ALLOWANCE: 'allowance',
  BENEFICIARY: 'beneficiary',
  PERMISSIONS: 'permissions',
};

export const configureInputs = (type: `${AuthorizationType}` | null) => {
  switch (type) {
    case AuthorizationType.TransferTicker:
      return [
        {
          id: INPUT_NAMES.TARGET,
          label: 'DID',
          type: 'text',
          placeholder: 'Enter DID',
        },
        {
          id: INPUT_NAMES.EXPIRY,
          label: 'Expire Date',
          type: 'date',
          optional: true,
        },
      ];
    case AuthorizationType.TransferAssetOwnership:
      return [
        {
          id: INPUT_NAMES.TARGET,
          label: 'DID',
          type: 'text',
          placeholder: 'Enter DID',
        },
        {
          id: INPUT_NAMES.EXPIRY,
          label: 'Expire Date',
          type: 'date',
        },
      ];
    case AuthorizationType.JoinIdentity:
      return [
        {
          id: INPUT_NAMES.TARGET_ACCOUNT,
          label: 'Account',
          type: 'text',
          placeholder: 'Enter Account key',
        },
        {
          id: INPUT_NAMES.EXPIRY,
          label: 'Expire Date',
          type: 'date',
        },
        // permissions
        // {

        // }
      ];
    case AuthorizationType.PortfolioCustody:
      return [
        {
          id: INPUT_NAMES.TARGET_IDENTITY,
          label: 'DID',
          type: 'text',
          placeholder: 'Enter DID',
        },
        {
          id: INPUT_NAMES.EXPIRY,
          label: 'Expire Date',
          type: 'date',
        },
      ];
    case AuthorizationType.BecomeAgent:
      return [
        {
          id: INPUT_NAMES.TARGET,
          label: 'DID',
          type: 'text',
          placeholder: 'Enter DID',
        },
        {
          id: INPUT_NAMES.EXPIRY,
          label: 'Expire Date',
          type: 'date',
        },
        {
          id: INPUT_NAMES.PERMISSIONS,
          label: 'Permissions',
          type: 'select',
          values: [
            { authType: PermissionGroupType.Full, name: 'Full Permissions' },
            {
              authType: PermissionGroupType.ExceptMeta,
              name: 'Full without Agent Permissions',
            },
            {
              authType: PermissionGroupType.PolymeshV1Caa,
              name: 'Corporate Action Agent',
            },
            {
              authType: PermissionGroupType.PolymeshV1Pia,
              name: 'Primary Issuance Agent',
            },
            {
              authType: 'Custom',
              name: 'Custom Permissions',
            },
          ],
        },
      ];
    case AuthorizationType.AddRelayerPayingKey:
      return [
        {
          id: INPUT_NAMES.ALLOWANCE,
          label: 'Allowance',
          type: 'text',
          placeholder: 'Enter POLYX amount',
        },
        {
          id: INPUT_NAMES.BENEFICIARY,
          label: 'Beneficiary',
          type: 'text',
          placeholder: 'Enter Account to subsidize',
        },
      ];

    default:
      return [];
  }
};
export const disabledAuthTypes = [
  AuthorizationType.AttestPrimaryKeyRotation,
  AuthorizationType.RotatePrimaryKey,
  AuthorizationType.RotatePrimaryKeyToSecondary,
  AuthorizationType.AddMultiSigSigner,
];
interface IFieldValues {
  target: string;
  targetAccount: string;
  targetIdentity: string;
  expiry: string;
  allowance: string;
  beneficiary: string;
  permissions: string;
}

export const useCustomForm = (authType: `${AuthorizationType}` | null) => {
  const { checkAddressValidity } = useTransferPolyx();
  const [type, setType] = useState<`${AuthorizationType}` | null>(null);
  const configRef = useRef({ mode: 'onTouched', defaultValues: {} });

  const useFormReturn = useForm<IFieldValues>(configRef.current);
  const {
    reset,
    formState: { errors },
  } = useFormReturn;

  const configOpts = useMemo(
    () => ({
      [AuthorizationType.TransferTicker]: {
        mode: 'onTouched',
        defaultValues: {
          [INPUT_NAMES.TARGET]: '',
          [INPUT_NAMES.EXPIRY]: '',
        },
        resolver: yupResolver(
          yup.object().shape({
            [INPUT_NAMES.TARGET]: yup
              .string()
              .required('Target is required')
              .test(
                'length',
                'Target must be valid DID',
                (value) => value.length === 66,
              ),
          }),
        ),
      },
      [AuthorizationType.TransferAssetOwnership]: {
        mode: 'onTouched',
        defaultValues: {
          [INPUT_NAMES.TARGET]: '',
          [INPUT_NAMES.EXPIRY]: '',
        },
        resolver: yupResolver(
          yup.object().shape({
            [INPUT_NAMES.TARGET]: yup
              .string()
              .required('Target is required')
              .test(
                'length',
                'Target must be valid DID',
                (value) => value.length === 66,
              ),
          }),
        ),
      },
      [AuthorizationType.JoinIdentity]: {
        mode: 'onTouched',
        defaultValues: {
          [INPUT_NAMES.TARGET_ACCOUNT]: '',
          [INPUT_NAMES.EXPIRY]: '',
          //   permissions:
        },
        resolver: yupResolver(
          yup.object().shape({
            [INPUT_NAMES.TARGET_ACCOUNT]: yup
              .string()
              .required('Address is required')
              .test(
                'is-valid-address',
                'Address must be valid SS58 format',
                async (value) => {
                  const result = await checkAddressValidity(value);
                  return result;
                },
              ),

            // permissions:
          }),
        ),
      },
      [AuthorizationType.PortfolioCustody]: {
        mode: 'onTouched',
        defaultValues: {
          [INPUT_NAMES.TARGET_IDENTITY]: '',
          [INPUT_NAMES.EXPIRY]: '',
        },
        resolver: yupResolver(
          yup.object().shape({
            [INPUT_NAMES.TARGET_IDENTITY]: yup
              .string()
              .required('Target is required')
              .test(
                'length',
                'Target must be valid DID',
                (value) => value.length === 66,
              ),
          }),
        ),
      },
      [AuthorizationType.BecomeAgent]: {
        mode: 'onTouched',
        defaultValues: {
          [INPUT_NAMES.TARGET]: '',
          [INPUT_NAMES.EXPIRY]: '',
          [INPUT_NAMES.PERMISSIONS]: '',
        },
        resolver: yupResolver(
          yup.object().shape({
            [INPUT_NAMES.TARGET]: yup
              .string()
              .required('Target is required')
              .test(
                'length',
                'Target must be valid DID',
                (value) => value.length === 66,
              ),
            [INPUT_NAMES.PERMISSIONS]: yup
              .string()
              .required('Permission is required'),
          }),
        ),
      },
      [AuthorizationType.AddRelayerPayingKey]: {
        mode: 'onTouched',
        defaultValues: {
          [INPUT_NAMES.ALLOWANCE]: '',
          [INPUT_NAMES.BENEFICIARY]: '',
        },
        resolver: yupResolver(
          yup.object().shape({
            [INPUT_NAMES.ALLOWANCE]: yup
              .number()
              .required('Allowance is required')
              .typeError('Amount must be a number'),
            [INPUT_NAMES.BENEFICIARY]: yup
              .string()
              .required('Beneficiary is required')
              .test(
                'is-valid-address',
                'Address must be valid SS58 format',
                async (value) => {
                  const result = await checkAddressValidity(value);
                  return result;
                },
              ),
          }),
        ),
      },
    }),
    [checkAddressValidity],
  );

  useEffect(() => {
    if (!authType || disabledAuthTypes.includes(authType)) return;

    setType(authType);

    if (Object.keys(errors).length) {
      reset();
    }
  }, [authType, errors, reset]);

  useEffect(() => {
    if (!type) return;

    configRef.current = configOpts[type];
  }, [type, configOpts]);

  return useFormReturn;
};
