import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { AddInstructionWithVenueIdParams } from '@polymeshassociation/polymesh-sdk/types';
import { TSelectedAsset } from '~/components/AssetForm/constants';
import { TSelectedLeg } from '~/components/LegSelect/types';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { IAdvancedFieldValues, IBasicFieldValues } from './config';

export const getAssetValue = (asset: TSelectedAsset | TSelectedLeg) =>
  'amount' in asset ? { amount: asset.amount } : { nfts: asset.nfts };

export const createBasicInstructionParams = ({
  selectedAssets,
  selectedPortfolio,
  formData,
}: {
  selectedAssets: TSelectedAsset[];
  selectedPortfolio: IPortfolioData;
  formData: IBasicFieldValues;
}): AddInstructionWithVenueIdParams => {
  const { recipient, memo } = formData;

  // Extract venue ID from format "id / description" or handle empty/undefined
  const venueId =
    formData.venue && formData.venue.trim() !== ''
      ? new BigNumber(formData.venue.split('/')[0].trim())
      : undefined;

  const instructionParams = {
    legs: selectedAssets.map((selectedAsset) => ({
      ...getAssetValue(selectedAsset),
      asset: selectedAsset.asset,
      from: selectedPortfolio.portfolio,
      to: recipient,
    })),
    memo,
    venueId,
  } satisfies AddInstructionWithVenueIdParams;

  return instructionParams;
};

export const createAdvancedInstructionParams = ({
  selectedLegs,
  formData,
}: {
  selectedLegs: TSelectedLeg[];
  formData: IAdvancedFieldValues;
}): AddInstructionWithVenueIdParams => {
  const { valueDate, tradeDate, memo } = formData;

  // Extract venue ID from format "id / description" or handle empty/undefined
  const venueId =
    formData.venue && formData.venue.trim() !== ''
      ? new BigNumber(formData.venue.split('/')[0].trim())
      : undefined;

  const instructionParams = {
    legs: selectedLegs.map((selectedAsset) => ({
      ...getAssetValue(selectedAsset),
      asset: selectedAsset.asset,
      from: selectedAsset.from,
      to: selectedAsset.to,
    })),
    valueDate: valueDate ?? undefined,
    tradeDate: tradeDate ?? undefined,
    memo,
    venueId,
  } satisfies AddInstructionWithVenueIdParams;

  return instructionParams;
};
