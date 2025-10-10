import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { AddInstructionWithVenueIdParams } from '@polymeshassociation/polymesh-sdk/types';
import { TSelectedAsset } from '~/components/AssetForm/constants';
import { TSelectedLeg } from '~/components/LegSelect/types';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { IAdvancedFieldValues, IBasicFieldValues } from './config';

export const getAssetValue = (asset: TSelectedAsset | TSelectedLeg) =>
  'amount' in asset ? { amount: asset.amount } : { nfts: asset.nfts };

/**
 * Extracts venue ID from the formatted string "id / description"
 * Returns undefined if venue is empty or not provided
 */
export const parseVenueId = (venue?: string): BigNumber | undefined => {
  if (!venue || venue.trim() === '') {
    return undefined;
  }
  return new BigNumber(venue.split('/')[0].trim());
};

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

  const instructionParams = {
    legs: selectedAssets.map((selectedAsset) => ({
      ...getAssetValue(selectedAsset),
      asset: selectedAsset.asset,
      from: selectedPortfolio.portfolio,
      to: recipient,
    })),
    memo,
    venueId: parseVenueId(formData.venue),
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
    venueId: parseVenueId(formData.venue),
  } satisfies AddInstructionWithVenueIdParams;

  return instructionParams;
};
