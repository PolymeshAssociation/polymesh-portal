import { ExtrinsicData } from '@polymeshassociation/polymesh-sdk/types';
import { balanceToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ITransferEvent, IAddress } from '~/constants/queries/types';
import { toParsedDateTime } from '~/helpers/dateTime';
import { splitByCapitalLetters } from '~/helpers/formatters';
import { getExtrinsicTime } from '~/helpers/graphqlQueries';
import { IHistoricalItem, ITokenItem } from './constants';

export const parseExtrinsicHistory = async (
  extrinsicHistory: ExtrinsicData[],
  gqlClient: ApolloClient<NormalizedCacheObject>,
) => {
  const parsedData = await Promise.all(
    extrinsicHistory.map(
      async ({ blockNumber, extrinsicIdx, success, txTag }) => ({
        extrinsicId: `${blockNumber.toString()}-${extrinsicIdx.toString()}`,
        dateTime: await getExtrinsicTime(blockNumber, extrinsicIdx, gqlClient),
        module: txTag.split('.')[0],
        call: splitByCapitalLetters(txTag.split('.')[1]),
        success,
      }),
    ),
  );
  return parsedData as IHistoricalItem[];
};

export const parseTokenActivity = (tokenActivity: ITransferEvent[]) => {
  return tokenActivity.map(
    ({ id, blockId, extrinsicIdx, block, attributes }: ITransferEvent) => {
      const [
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        { value: caller },
        { value: asset },
        { value: from },
        { value: to },
        { value: amount },
      ] = attributes;
      return {
        id: {
          eventId: id.replace('/', '-'),
          blockId: blockId.toString(),
          extrinsicIdx,
        },
        dateTime: toParsedDateTime(block.datetime),
        from: (from as IAddress).did,
        to: (to as IAddress).did,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        amount: balanceToBigNumber(amount as number).toString(),
        asset: asset as string,
      };
    },
  ) as ITokenItem[];
};
