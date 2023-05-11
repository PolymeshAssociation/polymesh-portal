import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FieldValues, useForm, ValidationMode } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
import { PolymeshContext } from '~/context/PolymeshContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { AuthorizationsContext } from '~/context/AuthorizationsContext';
import { useTransactionStatus, useTransferPolyx } from '~/hooks/polymesh';
import { notifyError, notifyWarning } from '~/helpers/notifications';
import {
  INPUT_NAMES,
  IFieldValues,
  disabledAuthTypes,
  AllowedAuthTypes,
} from './constants';
import { removeTimezoneOffset } from '~/helpers/dateTime';

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

  //   Multi form config object with auth type as key
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
              .matches(/^0x[0-9a-fA-F]{64}$/, 'Target must be valid DID'),
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
              .matches(/^0x[0-9a-fA-F]{64}$/, 'Target must be valid DID'),
            [INPUT_NAMES.ASSET]: yup.string().required('Asset is required'),
          }),
        ),
      },
      [AuthorizationType.JoinIdentity]: {
        mode: 'onTouched' as keyof ValidationMode,
        defaultValues: {
          [INPUT_NAMES.TARGET_ACCOUNT]: '',
          [INPUT_NAMES.EXPIRY]: '',
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
              .matches(/^0x[0-9a-fA-F]{64}$/, 'Target must be valid DID'),
            [INPUT_NAMES.PORTFOLIO]: yup
              .string()
              .required('Portfolio is required'),
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
              .matches(/^0x[0-9a-fA-F]{64}$/, 'Target must be valid DID'),
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

  //   Set selected type to state and reset form
  useEffect(() => {
    if (!authType || disabledAuthTypes.includes(authType as AllowedAuthTypes))
      return;

    setType(authType as AllowedAuthTypes);

    if (Object.keys(errors).length) {
      reset();
    }
  }, [authType, errors, reset]);

  //   Set config for selected auth type
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
  const { allPortfolios } = useContext(PortfolioContext);
  const { handleStatusChange } = useTransactionStatus();
  const { refreshAuthorizations } = useContext(AuthorizationsContext);

  //   Retrieve held asset and ticker reservation entities
  useEffect(() => {
    if (!sdk) return;

    (async () => {
      const assets = await sdk.assets.getAssets();
      const reservedTickers = await sdk.assets.getTickerReservations();
      setHeldAssets(assets);
      setTickerReservations(reservedTickers);
    })();
  }, [sdk]);

  //   Multi submit handlers object with auth type as key
  const submitHandler = {
    [AuthorizationType.TransferTicker]: async (data: FieldValues) => {
      if (!sdk) return;
      const target = data.target as string;
      const ticker = data.ticker as string;
      const utcExpiry = data.expiry as string | undefined;

      const tickerReservation = tickerReservations.find(
        (reservation) => reservation.ticker === ticker,
      );
      if (!tickerReservation) {
        notifyWarning('Selected ticker does not exist');
        return;
      }

      const expiry = utcExpiry
        ? removeTimezoneOffset(new Date(utcExpiry))
        : null;

      const args = expiry ? { expiry, target } : { target };

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
        refreshAuthorizations();
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
      const utcExpiry = data.expiry as string | undefined;

      const assetEntity = heldAssets.find(({ ticker }) => ticker === asset);
      if (!assetEntity) {
        notifyWarning('Selected ticker does not exist');
        return;
      }

      const expiry = utcExpiry
        ? removeTimezoneOffset(new Date(utcExpiry))
        : null;

      const args = expiry ? { expiry, target } : { target };

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
        refreshAuthorizations();
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
      const utcExpiry = data.expiry as string | undefined;
      const expiry = utcExpiry
        ? removeTimezoneOffset(new Date(utcExpiry))
        : null;

      const args = expiry ? { expiry, targetAccount } : { targetAccount };

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
        refreshAuthorizations();
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        if (unsubCb) {
          unsubCb();
        }
      }
    },

    [AuthorizationType.PortfolioCustody]: async (data: FieldValues) => {
      if (!sdk) return;
      const targetIdentity = data.targetIdentity as string;
      const portfolio = data.portfolio as string;
      const utcExpiry = data.expiry as string | undefined;

      const portfolioEntity = allPortfolios.find(
        ({ name }) => name === portfolio,
      )?.portfolio;

      if (!portfolioEntity) {
        notifyWarning('Selected portfolio does not exist');
        return;
      }

      const expiry = utcExpiry
        ? removeTimezoneOffset(new Date(utcExpiry))
        : null;

      const args = expiry
        ? {
            expiry,
            targetIdentity,
          }
        : { targetIdentity };

      let unsubCb: UnsubCallback | undefined;
      try {
        const {
          signerPermissions: { result },
        } = await portfolioEntity.setCustodian.checkAuthorization(args);
        if (!result) {
          notifyWarning(
            "The signing Account doesn't have the required permissions to execute this procedure",
          );
          return;
        }

        const tx = await portfolioEntity.setCustodian(args);
        unsubCb = tx.onStatusChange(handleStatusChange);
        await tx.run();
        refreshAuthorizations();
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        if (unsubCb) {
          unsubCb();
        }
      }
    },

    [AuthorizationType.BecomeAgent]: async (data: FieldValues) => {
      if (!sdk) return;
      const target = data.target as string;
      const asset = data.asset as string;
      const permissions = data.permissions as
        | `${PermissionGroupType}`
        | 'Custom';
      const utcExpiry = data.expiry as string | undefined;
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

      const expiry = utcExpiry
        ? removeTimezoneOffset(new Date(utcExpiry))
        : null;

      const args = expiry
        ? {
            expiry,
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
        refreshAuthorizations();
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
        refreshAuthorizations();
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
      [AuthorizationType.PortfolioCustody]: allPortfolios,
    },
    typesWithRequiredEntityData: [
      AuthorizationType.TransferTicker,
      AuthorizationType.TransferAssetOwnership,
      AuthorizationType.BecomeAgent,
      AuthorizationType.PortfolioCustody,
    ],
  };
};
