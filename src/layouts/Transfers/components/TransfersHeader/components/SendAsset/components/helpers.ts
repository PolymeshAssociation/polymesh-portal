import {
  AddInstructionParams,
  Identity,
} from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { ISelectedAsset } from '~/components/AssetSelect/types';
import { IAdvancedFieldValues, IBasicFieldValues } from './config';
import { ISelectedLeg } from '~/components/LegSelect/types';

export const updateAssetsOnSelect = (
  item: ISelectedAsset,
  selectedAssets: ISelectedAsset[],
) => {
  return selectedAssets.reduce((acc, assetItem) => {
    if (assetItem.asset === item.asset && assetItem.index !== item.index) {
      return [...acc, { ...assetItem, amount: item.amount }];
    }

    if (assetItem.index === item.index) {
      const updatedAcc = acc.filter(({ index }) => index !== item.index);

      return [
        ...updatedAcc,
        {
          ...assetItem,
          asset: item.asset,
          amount: item.amount,
        },
      ];
    }

    return [...acc, assetItem];
  }, [] as ISelectedAsset[]);
};

export const updateLegsOnSelect = (
  item: ISelectedLeg,
  selectedLegs: ISelectedLeg[],
) => {
  return selectedLegs.reduce((acc, assetItem) => {
    if (assetItem.asset === item.asset && assetItem.index !== item.index) {
      return [...acc, { ...assetItem, amount: item.amount }];
    }

    if (assetItem.index === item.index) {
      const updatedAcc = acc.filter(({ index }) => index !== item.index);

      return [
        ...updatedAcc,
        {
          ...assetItem,
          asset: item.asset,
          amount: item.amount,
          from: item.from,
          to: item.to,
        },
      ];
    }

    return [...acc, assetItem];
  }, [] as ISelectedLeg[]);
};

export const createBasicInstructionParams = ({
  selectedAssets,
  identity,
  formData,
}: {
  selectedAssets: ISelectedAsset[];
  identity: Identity;
  formData: IBasicFieldValues;
}) => {
  const { recipient } = formData;
  const instructionParams = {
    legs: selectedAssets.map((selectedAsset) => ({
      amount: new BigNumber(selectedAsset.amount),
      asset: selectedAsset.asset,
      from: identity.did,
      to: recipient,
    })),
  } as AddInstructionParams;

  return instructionParams;
};

export const createAdvancedInstructionParams = ({
  selectedLegs,
  formData,
}: {
  selectedLegs: ISelectedLeg[];
  formData: IAdvancedFieldValues;
}) => {
  const { valueDate, tradeDate } = formData;
  const instructionParams = {
    legs: selectedLegs.map(({ amount, asset, from, to }) => ({
      amount: new BigNumber(amount),
      asset,
      from,
      to,
    })),
    valueDate,
    tradeDate,
  } as AddInstructionParams;

  return instructionParams;
};
