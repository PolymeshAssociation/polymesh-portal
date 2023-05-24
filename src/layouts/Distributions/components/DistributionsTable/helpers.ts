/* eslint-disable @typescript-eslint/no-unused-vars */
import { Balance } from '@polymeshassociation/polymesh-sdk/types';
import { balanceToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { ITransferEvent, ITicker, IDividend } from '~/constants/queries/types';
import { toParsedDate } from '~/helpers/dateTime';
import { IHistoricalDistribution } from './constants';

export const parseHistoricalDistributions = (
  distributions: ITransferEvent[],
) => {
  return distributions.map(
    ({ id, blockId, extrinsicIdx, block, attributes }: ITransferEvent) => {
      const [
        { value: caller },
        { value: did },
        { value: asset },
        { value: dividend },
        { value: amount },
        { value: tax },
      ] = attributes;
      return {
        id: {
          eventId: id.replace('/', '-'),
          blockId: blockId.toString(),
          extrinsicIdx,
        },
        dateTime: toParsedDate(block.datetime),
        asset: (asset as ITicker).ticker,
        currency: (dividend as IDividend).currency,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        amount: balanceToBigNumber((dividend as IDividend).amount).toNumber(),
        perShare: balanceToBigNumber(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (dividend as IDividend).perShare,
        ).toNumber(),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        tax: balanceToBigNumber(tax as number).toNumber(),
      };
    },
  ) as IHistoricalDistribution[];
};
