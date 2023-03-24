import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { gqlClient } from '~/App';
import { getExtrinsicTimestamp } from '~/constants/queries';
import { toParsedDateTime } from './dateTime';

export const getExtrinsicTime = async (
  blockNumber: BigNumber,
  extrinsicIdx: BigNumber,
) => {
  const id = `${blockNumber.toString()}/${extrinsicIdx.toString()}`;

  try {
    const response = await gqlClient.query({
      query: getExtrinsicTimestamp,
      variables: {
        id,
      },
    });
    if (!response) return '';

    const timeStamp = response.data?.extrinsics?.nodes[0]?.block.datetime;

    return toParsedDateTime(timeStamp);
  } catch (error) {
    return '';
  }
};
