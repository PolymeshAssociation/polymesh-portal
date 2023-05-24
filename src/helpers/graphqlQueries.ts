import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { gql } from '@apollo/client';
import { gqlClient } from '~/config/graphql';
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

const getQueryFilter = (identityId: string, portfolioId: string | null) => {
  if (!portfolioId) {
    return `{ value: { did: "${identityId}" } }`;
  }

  if (portfolioId === 'default') {
    return `{ value: { did: "${identityId}", kind: { Default: null } } }`;
  }

  return `{ value: { did: "${identityId}", kind: { User: ${Number(
    portfolioId,
  )} } } }`;
};

export const transferEventsQuery = ({
  identityId,
  portfolioId,
  offset,
  pageSize,
}: {
  identityId: string;
  portfolioId: string | null;
  offset: number;
  pageSize: number;
}) => {
  const portfolioIdFilter = getQueryFilter(identityId, portfolioId);

  const query = gql`
    query {
      events(
        first: ${pageSize}
        offset: ${offset}
        orderBy: CREATED_AT_DESC
        filter: {
          moduleId: { equalTo: asset }
          eventId: { equalTo: Transfer }
          attributes: { contains: [${portfolioIdFilter}] }
        }
      ) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        nodes {
          id
          blockId
          moduleId
          eventId
          attributes
          block {
            datetime
          }
          extrinsicIdx
          transferTo
        }
      }
    }
  `;

  return query;
};

export const portfolioMovementsQuery = ({
  offset,
  pageSize,
  portfolioNumber,
}: {
  offset: number;
  pageSize: number;
  portfolioNumber: string;
}) => {
  const query = gql`
    query {
      portfolioMovements(
        first: ${pageSize}
        offset: ${offset}
        orderBy: CREATED_AT_DESC
        filter: {
          or: [
            { fromId: { startsWith: "${portfolioNumber}" } }
            { toId: { startsWith: "${portfolioNumber}" } }
          ]
        }
      ) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        nodes {
          id
          fromId
          from {
            identityId
            number
            name
          }
          toId
          to {
            identityId
            number
            name
          }
          assetId
          amount
          address
          memo
          createdBlock {
            blockId
            datetime
          }
        }
      }
    }
  `;

  return query;
};

export const historicalDistributionsQuery = ({
  offset,
  pageSize,
  did,
}: {
  offset: number;
  pageSize: number;
  did: string;
}) => {
  const query = gql`
    query {
      events(
        first: ${pageSize}
        offset: ${offset}
        orderBy: CREATED_AT_DESC
        filter: {
          moduleId: { equalTo: capitaldistribution }
          eventId: { equalTo: BenefitClaimed }
          attributes: {
            contains: [
              {
                value: "${did}"
              }
            ]
          }
        }
      ) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        nodes {
          id
          blockId
          moduleId
          eventId
          extrinsicIdx
          attributes
          block {
            datetime
          }
        }
      }
    }
  `;

  return query;
};
