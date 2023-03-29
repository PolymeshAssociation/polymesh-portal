import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { gqlClient } from '~/App';
import {
  getExtrinsicTimestamp,
  getTimestampByBlockHash,
} from '~/constants/queries';
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

export const getTimeByBlockHash = async (hash: string) => {
  try {
    const response = await gqlClient.query({
      query: getTimestampByBlockHash,
      variables: { hash },
    });
    if (!response) return '';

    const timeStamp = response.data?.blocks?.nodes[0]?.datetime;

    return toParsedDateTime(timeStamp);
  } catch (error) {
    return '';
  }
};
