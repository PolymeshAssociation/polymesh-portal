// import { Balance } from '@polymeshassociation/polymesh-sdk/types';
import { balanceToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import {
  // ITransferEvent,
  // ITicker,
  // IDividend,
  IDistribution,
} from '~/constants/queries/types';
import { toParsedDate } from '~/helpers/dateTime';
import { IHistoricalDistribution } from './constants';

export const parseHistoricalDistributions = (
  distributions: IDistribution[],
) => {
  return distributions.map(
    ({
      id,
      createdBlockId,
      distributionId,
      amount,
      amountAfterTax,
      tax,
      distribution: {
        currency,
        perShare,
        assetId,
        portfolioId,
        portfolio: { name: portfolioName },
      },
      createdAt,
    }) => {
      return {
        id: {
          eventId: id.replace('/', '-'),
          blockId: createdBlockId,
        },
        dateTime: toParsedDate(createdAt),
        asset: assetId,
        currency,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        amountAfterTax: balanceToBigNumber(Number(amountAfterTax)).toNumber(),
        details: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          amount: balanceToBigNumber(Number(amount)).toNumber(),
          perShare: balanceToBigNumber(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            Number(perShare),
          ).toNumber(),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          taxPercentage: balanceToBigNumber(Number(tax)).toNumber() * 100,
          distributionId,
          portfolio: {
            did: portfolioId.split('/')[0],
            id: Number(portfolioId.split('/')[1]),
            name: portfolioName,
          },
        },
      } as IHistoricalDistribution;
    },
  );
};

// export const parseHistoricalDistributions = (
//   distributions: ITransferEvent[],
// ) => {
//   return distributions.map(
//     ({ id, blockId, extrinsicIdx, block, attributes }: ITransferEvent) => {
//       const [
//         { value: caller },
//         { value: did },
//         { value: asset },
//         { value: dividend },
//         { value: amount },
//         { value: tax },
//       ] = attributes;
//       return {
//         id: {
//           eventId: id.replace('/', '-'),
//           blockId: blockId.toString(),
//           extrinsicIdx,
//         },
//         dateTime: toParsedDate(block.datetime),
//         asset: (asset as ITicker).ticker,
//         currency: (dividend as IDividend).currency,
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         amount: balanceToBigNumber((dividend as IDividend).amount).toNumber(),
//         perShare: balanceToBigNumber(
//           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//           // @ts-ignore
//           (dividend as IDividend).perShare,
//         ).toNumber(),
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         tax: balanceToBigNumber(tax as number).toNumber(),
//       };
//     },
//   ) as IHistoricalDistribution[];
// };
