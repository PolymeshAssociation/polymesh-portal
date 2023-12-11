import { ExtrinsicData } from '@polymeshassociation/polymesh-sdk/types';
import { balanceToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { ITransferEvent, IAssetTransaction, IAddress } from '~/constants/queries/types';
import { toParsedDateTime } from '~/helpers/dateTime';
import { splitByCapitalLetters } from '~/helpers/formatters';
import { IHistoricalItem, ITokenItem } from './constants';

export const parseExtrinsicHistory = async (
  extrinsicHistory: ExtrinsicData[],
) => {
  const parsedData = await Promise.all(
    extrinsicHistory.map(
      async ({ blockNumber, extrinsicIdx, success, txTag, blockDate }) => ({
        extrinsicId: `${blockNumber.toString()}-${extrinsicIdx.toString()}`,
        dateTime: toParsedDateTime(blockDate),
        module: txTag.split('.')[0],
        call: splitByCapitalLetters(txTag.split('.')[1]),
        success,
      }),
    ),
  );
  return parsedData as IHistoricalItem[];
};

export const parseTokenActivity = (tokenActivity: IAssetTransaction[]) => {
  return tokenActivity.map(
    ({ id, createdBlockId,eventIdx, datetime, amount, fromPortfolioId, toPortfolioId, assetId }: IAssetTransaction) => {
      return {
        id: {
          eventId: id.replace('/', '-'),
          blockId: createdBlockId.toString(),
          extrinsicIdx: eventIdx,
        },
        dateTime: toParsedDateTime(datetime),
        from: fromPortfolioId.split('/')[0],
        to: toPortfolioId.split('/')[0],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        amount: balanceToBigNumber(amount as number).toString(),
        asset: assetId,
      };
    },
  ) as ITokenItem[];
};
