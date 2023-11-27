import {
  AddInstructionParams,
  Identity,
} from '@polymeshassociation/polymesh-sdk/types';
import { TSelectedAsset, IFungibleAsset } from '~/components/AssetForm/constants';
import { IAdvancedFieldValues, IBasicFieldValues } from './config';
import { TSelectedLeg } from '~/components/LegSelect/types';

export const getAssetValue = (asset: TSelectedAsset | TSelectedLeg) =>
  'amount' in asset ? { amount: asset.amount } : { nfts: asset.nfts };

export const createBasicInstructionParams = ({
  selectedAssets,
  identity,
  formData,
}: {
  selectedAssets: TSelectedAsset[];
  identity: Identity;
  formData: IBasicFieldValues;
}) => {
  const { recipient, memo } = formData;
  const instructionParams = {
    legs: selectedAssets.map((selectedAsset) => ({
      ...getAssetValue(selectedAsset),
      asset: selectedAsset.asset,
      from: identity.did,
      to: recipient,
    })),
    memo,
  } as AddInstructionParams;

  return instructionParams;
};

export const createAdvancedInstructionParams = ({
  selectedLegs,
  formData,
}: {
  selectedLegs: TSelectedLeg[];
  formData: IAdvancedFieldValues;
}) => {
  const { valueDate, tradeDate, memo } = formData;
  const instructionParams = {
    legs: selectedLegs.map((selectedAsset) => ({
      ...getAssetValue(selectedAsset),
      asset: selectedAsset.asset,
      from: selectedAsset.from,
      to: selectedAsset.to,
    })),
    valueDate,
    tradeDate,
    memo,
  } as AddInstructionParams;

  return instructionParams;
};
