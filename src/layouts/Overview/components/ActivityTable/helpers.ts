import { ExtrinsicData } from '@polymeshassociation/polymesh-sdk/types';
import { hexToUuid } from '@polymeshassociation/polymesh-sdk/utils';
import { IAssetTransaction } from '~/constants/queries/types';
import { toParsedDateTime } from '~/helpers/dateTime';
import { splitCamelCase } from '~/helpers/formatters';
import { IHistoricalItem, ITransactionItem } from './constants';

export const parseExtrinsicHistory = async (
  extrinsicHistory: ExtrinsicData[],
) => {
  const parsedData = await Promise.all(
    extrinsicHistory.map(
      async ({ blockNumber, extrinsicIdx, success, txTag, blockDate }) => ({
        extrinsicId: `${blockNumber.toString()}-${extrinsicIdx.toString()}`,
        dateTime: toParsedDateTime(blockDate),
        module: txTag.split('.')[0],
        call: splitCamelCase(txTag.split('.')[1]),
        success,
      }),
    ),
  );
  return parsedData as IHistoricalItem[];
};

export const parseTokenActivity = (tokenActivity: IAssetTransaction[]) => {
  return tokenActivity.map(
    ({
      id,
      createdBlockId,
      datetime,
      amount,
      fromPortfolioId,
      toPortfolioId,
      assetId,
      instructionId,
      extrinsicIdx,
      asset,
    }: IAssetTransaction): ITransactionItem => {
      return {
        id: {
          eventId: id.replace('/', '-'),
          blockId: createdBlockId,
          extrinsicIdx,
          instructionId,
        },
        dateTime: toParsedDateTime(datetime),
        from: fromPortfolioId ? fromPortfolioId.split('/')[0] : '',
        to: toPortfolioId ? toPortfolioId.split('/')[0] : '',
        amount: amount ? (amount / 1_000_000).toString() : '0',
        asset: hexToUuid(assetId),
        tokenDetails: asset,
      };
    },
  );
};
