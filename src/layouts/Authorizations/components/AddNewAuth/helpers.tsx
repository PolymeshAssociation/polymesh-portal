import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Asset,
  AuthorizationType,
  CustomPermissionGroup,
  KnownPermissionGroup,
  PermissionGroupType,
  TickerReservation,
  UnsubCallback,
} from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { FieldValues, useForm, ValidationMode } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatus, useTransferPolyx } from '~/hooks/polymesh';
import { notifyError, notifyWarning } from '~/helpers/notifications';

const INPUT_NAMES = {
  TARGET: 'target',
  TARGET_ACCOUNT: 'targetAccount',
  TARGET_IDENTITY: 'targetIdentity',
  EXPIRY: 'expiry',
  ALLOWANCE: 'allowance',
  BENEFICIARY: 'beneficiary',
  PERMISSIONS: 'permissions',
  TICKER: 'ticker',
  ASSET: 'asset',
  GROUP_ID: 'groupId',
};

export interface IFieldValues {
  target: string;
  targetAccount: string;
  targetIdentity: string;
  expiry: string;
  allowance: string;
  beneficiary: string;
  permissions: string;
  ticker: string;
  asset: string;
  groupId: number;
}

interface IPermissionTypeValue {
  authType: string;
  name: string;
}

export const disabledAuthTypes = [
  AuthorizationType.AttestPrimaryKeyRotation,
  AuthorizationType.RotatePrimaryKey,
  AuthorizationType.RotatePrimaryKeyToSecondary,
  AuthorizationType.AddMultiSigSigner,
];

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
          label: 'Expiry Date (Optional)',
          type: 'date',
        },
        {
          id: INPUT_NAMES.TICKER,
          label: 'Ticker',
          type: 'select',
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
          label: 'Expiry Date (Optional)',
          type: 'date',
        },
        {
          id: INPUT_NAMES.ASSET,
          label: 'Asset',
          type: 'select',
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
          label: 'Expiry Date (Optional)',
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
          label: 'Expiry Date (Optional)',
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
          label: 'Expiry Date (Optional)',
          type: 'date',
        },
        {
          id: INPUT_NAMES.ASSET,
          label: 'Asset',
          type: 'select',
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
          ] as IPermissionTypeValue[],
        },
        {
          id: INPUT_NAMES.GROUP_ID,
          label: 'Custom Permission group ID',
          type: 'text',
          placeholder: 'Enter ID',
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

type AllowedAuthTypes =
  | AuthorizationType.TransferTicker
  | AuthorizationType.TransferAssetOwnership
  | AuthorizationType.JoinIdentity
  | AuthorizationType.AddRelayerPayingKey
  | AuthorizationType.BecomeAgent
  | AuthorizationType.PortfolioCustody;

export const useCustomForm = (authType: `${AuthorizationType}` | null) => {
  const { checkAddressValidity } = useTransferPolyx();
  const [type, setType] = useState<AllowedAuthTypes | null>(null);
  const configRef = useRef({
    mode: 'onTouched' as keyof ValidationMode,
    defaultValues: {},
  });

  const useFormReturn = useForm<IFieldValues>(configRef.current);
  const {
    reset,
    formState: { errors },
  } = useFormReturn;

  const configOpts = useMemo(
    () => ({
      [AuthorizationType.TransferTicker]: {
        mode: 'onTouched' as keyof ValidationMode,
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
            [INPUT_NAMES.TICKER]: yup.string().required('Ticker is required'),
          }),
        ),
      },
      [AuthorizationType.TransferAssetOwnership]: {
        mode: 'onTouched' as keyof ValidationMode,
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
            [INPUT_NAMES.ASSET]: yup.string().required('Asset is required'),
          }),
        ),
      },
      [AuthorizationType.JoinIdentity]: {
        mode: 'onTouched' as keyof ValidationMode,
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
        mode: 'onTouched' as keyof ValidationMode,
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
        mode: 'onTouched' as keyof ValidationMode,
        defaultValues: {
          [INPUT_NAMES.TARGET]: '',
          [INPUT_NAMES.EXPIRY]: '',
          [INPUT_NAMES.PERMISSIONS]: '',
          [INPUT_NAMES.ASSET]: '',
          [INPUT_NAMES.GROUP_ID]: 0,
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
            [INPUT_NAMES.ASSET]: yup.string().required('Asset is required'),
            [INPUT_NAMES.GROUP_ID]: yup
              .number()
              .transform((_, val) => (val ? Number(val) : null))
              .when(INPUT_NAMES.PERMISSIONS, {
                is: 'Custom',
                then: (schema) =>
                  schema
                    .required('ID is required')
                    .typeError('ID must be a number'),
                otherwise: (schema) => schema.optional().nullable(),
              }),
          }),
        ),
      },
      [AuthorizationType.AddRelayerPayingKey]: {
        mode: 'onTouched' as keyof ValidationMode,
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
    if (!authType || disabledAuthTypes.includes(authType as AllowedAuthTypes))
      return;

    setType(authType as AllowedAuthTypes);

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

export const useSubmitHandler = () => {
  const [heldAssets, setHeldAssets] = useState<Asset[]>([]);
  const [tickerReservations, setTickerReservations] = useState<
    TickerReservation[]
  >([]);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { handleStatusChange } = useTransactionStatus();

  useEffect(() => {
    if (!sdk) return;

    (async () => {
      const assets = await sdk.assets.getAssets();
      const reservedTickers = await sdk.assets.getTickerReservations();
      setHeldAssets(assets);
      setTickerReservations(reservedTickers);
    })();
  }, [sdk]);

  const submitHandler = {
    [AuthorizationType.TransferTicker]: async (data: FieldValues) => {
      if (!sdk) return;
      const target = data.target as string;
      const ticker = data.ticker as string;
      const expiry = data.expiry as string | undefined;

      const tickerReservation = tickerReservations.find(
        (reservation) => reservation.ticker === ticker,
      );
      if (!tickerReservation) {
        notifyWarning('Selected ticker does not exist');
        return;
      }

      const args = expiry ? { expiry: new Date(expiry), target } : { target };

      let unsubCb: UnsubCallback | undefined;
      try {
        const {
          signerPermissions: { result },
        } = await tickerReservation.transferOwnership.checkAuthorization(args);
        if (!result) {
          notifyWarning(
            "The signing Account doesn't have the required permissions to execute this procedure",
          );
          return;
        }

        const tx = await tickerReservation.transferOwnership(args);
        unsubCb = tx.onStatusChange(handleStatusChange);
        await tx.run();
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        if (unsubCb) {
          unsubCb();
        }
      }
    },

    [AuthorizationType.TransferAssetOwnership]: async (data: FieldValues) => {
      if (!sdk) return;
      const target = data.target as string;
      const asset = data.asset as string;
      const expiry = data.expiry as string | undefined;

      const assetEntity = heldAssets.find(({ ticker }) => ticker === asset);
      if (!assetEntity) {
        notifyWarning('Selected ticker does not exist');
        return;
      }

      const args = expiry ? { expiry: new Date(expiry), target } : { target };

      let unsubCb: UnsubCallback | undefined;
      try {
        const {
          signerPermissions: { result },
        } = await assetEntity.transferOwnership.checkAuthorization(args);
        if (!result) {
          notifyWarning(
            "The signing Account doesn't have the required permissions to execute this procedure",
          );
          return;
        }

        const tx = await assetEntity.transferOwnership(args);
        unsubCb = tx.onStatusChange(handleStatusChange);
        await tx.run();
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        if (unsubCb) {
          unsubCb();
        }
      }
    },

    [AuthorizationType.JoinIdentity]: async (data: FieldValues) => {
      if (!sdk) return;
      const targetAccount = data.targetAccount as string;
      const expiry = data.expiry as string | undefined;
      const args = expiry
        ? { expiry: new Date(expiry), targetAccount }
        : { targetAccount };

      let unsubCb: UnsubCallback | undefined;
      try {
        const {
          signerPermissions: { result },
        } = await sdk.accountManagement.inviteAccount.checkAuthorization(args);
        if (!result) {
          notifyWarning(
            "The signing Account doesn't have the required permissions to execute this procedure",
          );
          return;
        }

        const tx = await sdk.accountManagement.inviteAccount(args);
        unsubCb = tx.onStatusChange(handleStatusChange);
        await tx.run();
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        if (unsubCb) {
          unsubCb();
        }
      }
    },

    [AuthorizationType.PortfolioCustody]: () => {},

    [AuthorizationType.BecomeAgent]: async (data: FieldValues) => {
      if (!sdk) return;
      const target = data.target as string;
      const asset = data.asset as string;
      const permissions = data.permissions as
        | `${PermissionGroupType}`
        | 'Custom';
      const expiry = data.expiry as string | undefined;
      const groupId = data.groupId as number | undefined;

      const assetEntity = heldAssets.find(({ ticker }) => ticker === asset);
      if (!assetEntity) {
        notifyWarning('Selected ticker does not exist');
        return;
      }

      let permissionGroupEntity:
        | KnownPermissionGroup
        | CustomPermissionGroup
        | undefined;

      if (permissions === 'Custom' && groupId) {
        try {
          permissionGroupEntity = await assetEntity.permissions.getGroup({
            id: new BigNumber(groupId),
          });
        } catch (error) {
          notifyError((error as Error).message);
          return;
        }
      } else {
        permissionGroupEntity = (
          await assetEntity.permissions.getGroups()
        ).known.find(({ type }) => type === permissions);
      }

      if (!permissionGroupEntity) {
        notifyWarning('Selected permission group does not exist');
        return;
      }

      const args = expiry
        ? {
            expiry: new Date(expiry),
            target,
            permissions: permissionGroupEntity,
          }
        : { target, permissions: permissionGroupEntity };

      let unsubCb: UnsubCallback | undefined;
      try {
        const {
          signerPermissions: { result },
        } = await assetEntity.permissions.inviteAgent.checkAuthorization(args);
        if (!result) {
          notifyWarning(
            "The signing Account doesn't have the required permissions to execute this procedure",
          );
          return;
        }

        const tx = await assetEntity.permissions.inviteAgent(args);
        unsubCb = tx.onStatusChange(handleStatusChange);
        await tx.run();
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        if (unsubCb) {
          unsubCb();
        }
      }
    },

    [AuthorizationType.AddRelayerPayingKey]: async (data: FieldValues) => {
      if (!sdk) return;
      const allowance = data.allowance as number;
      const beneficiary = data.beneficiary as string;
      const args = {
        allowance: new BigNumber(allowance),
        beneficiary,
      };

      let unsubCb: UnsubCallback | undefined;
      try {
        const {
          signerPermissions: { result },
        } = await sdk.accountManagement.subsidizeAccount.checkAuthorization(
          args,
        );

        if (!result) {
          notifyWarning(
            "The signing Account doesn't have the required permissions to execute this procedure",
          );
          return;
        }

        const tx = await sdk.accountManagement.subsidizeAccount(args);
        unsubCb = tx.onStatusChange(handleStatusChange);
        await tx.run();
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        if (unsubCb) {
          unsubCb();
        }
      }
    },
  };

  return {
    submitHandler,
    entityData: {
      [AuthorizationType.TransferTicker]: tickerReservations,
      [AuthorizationType.TransferAssetOwnership]: heldAssets,
      [AuthorizationType.BecomeAgent]: heldAssets,
    },
    typesWithRequiredEntityData: [
      AuthorizationType.TransferTicker,
      AuthorizationType.TransferAssetOwnership,
      AuthorizationType.BecomeAgent,
    ],
  };
};

export const renderParsedSelectedValue = (
  selectedValue: string | IPermissionTypeValue | number | undefined,
  permissionValues?: IPermissionTypeValue[],
) => {
  if (!selectedValue) return 'Select...';

  if (!permissionValues) return selectedValue as string;

  const parsedValue = permissionValues.find(
    ({ authType }) => authType === selectedValue,
  )?.name;
  return parsedValue || '';
};

export const selectInputsDefaultValue = {
  permissions: false,
  asset: false,
  ticker: false,
};
