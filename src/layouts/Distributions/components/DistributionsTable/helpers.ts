// import { Balance } from '@polymeshassociation/polymesh-sdk/types';
import { balanceToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { hexToUuid } from '@polymeshassociation/polymesh-sdk/utils';
import {
  // ITransferEvent,
  // ITicker,
  // IDividend,
  IDistribution,
} from '~/constants/queries/types';
import { toParsedDate } from '~/helpers/dateTime';
import { IHistoricalDistribution } from './constants';
import { removeLeadingZeros } from '~/helpers/formatters';

export const parseHistoricalDistributions = (
  distributions: IDistribution[],
) => {
  return distributions.map(
    ({
      id,
      createdBlock: { blockId, datetime },
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
    }) => {
      const [paddedBlockId, paddedEventIdx] = id.split('/');
      return {
        id: {
          eventId: `${removeLeadingZeros(paddedBlockId)}-${removeLeadingZeros(paddedEventIdx)}`,
          blockId: blockId.toString(),
        },
        dateTime: toParsedDate(datetime),
        asset: hexToUuid(assetId),
        currency: { id: hexToUuid(currency.id), ticker: currency.ticker },
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
