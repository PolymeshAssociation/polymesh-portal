import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client';
import {
  getExtrinsicTimestamp,
  getTimestampByBlockHash,
} from '~/constants/queries';
import { toParsedDateTime } from './dateTime';

export const getExtrinsicTime = async (
  blockNumber: BigNumber,
  extrinsicIdx: BigNumber,
  gqlClient: ApolloClient<NormalizedCacheObject>,
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

export const getTimeByBlockHash = async (
  hash: string,
  gqlClient: ApolloClient<NormalizedCacheObject>,
) => {
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
    distributionPayments(
      first: ${pageSize}
      offset: ${offset}
      orderBy: CREATED_AT_DESC
      filter: {
        targetId: {
          equalTo: "${did}"
        }
      }
      ) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        nodes {
          targetId
          distributionId
          amount
          amountAfterTax
          tax
          distribution {
            amount
            currency
            expiresAt
            portfolioId
            portfolio {
              name
            }
            assetId
            localId
            paymentAt
            perShare
          }
          createdAt
          createdBlockId
          datetime
          eventId
          id
          nodeId
          updatedAt
          updatedBlockId
        }
      }
    }
    `;

  return query;
};

export const StakingRewardsQuery = ({
  offset,
  pageSize,
  accountRawKey,
  identityId,
}: {
  offset: number;
  pageSize: number;
  accountRawKey?: string;
  identityId?: string;
}) => {
  if (!accountRawKey && !identityId) {
    throw new Error('an accountRawKey or identityId must be provided');
  }

  const accountFilter = accountRawKey
    ? `eventArg1: {equalTo: "${accountRawKey}" }`
    : '';
  const identityFilter = identityId
    ? `eventArg0: {equalTo: "${identityId}" }`
    : '';

  const query = gql`
    query {
      events(
        first: ${pageSize}
        offset: ${offset}
        orderBy: CREATED_AT_DESC
        filter: {
          moduleId: { equalTo: staking }
          eventId: { equalTo: Reward }
          ${accountFilter}
          ${identityFilter}
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
          eventArg0
          eventArg1
          eventArg2
          block {
            datetime
          }
        }
      }
    }
  `;

  return query;
};

export const getMultisigProposalsQuery = ({
  multisigId,
  ids = [],
  offset,
  pageSize,
  activeOnly = true,
}: {
  multisigId: string;
  ids?: number[];
  activeOnly?: boolean;
  offset?: number;
  pageSize?: number;
}) => {
  const statusFilter = activeOnly
    ? `status: { equalTo: Active }`
    : 'status: { notEqualTo: Active }';
  const offsetFiler = offset ? `offset: ${offset}` : '';
  const pageSizeFilter = pageSize ? `first: ${pageSize}` : '';

  let idFilter = '';
  if (ids.length > 0) {
    idFilter = `proposalId: { in: [${ids.join(',')}] }`;
  }

  const query = gql`
    query {
      multiSigProposals(
        ${offsetFiler}
        ${pageSizeFilter}
        filter: {
          multisigId: { equalTo: "${multisigId}" }
          ${statusFilter}
          ${idFilter}
        }
        orderBy: PROPOSAL_ID_DESC
      ) {
        totalCount
        nodes {
          approvalCount
          createdBlockId
          creatorAccount
          datetime
          extrinsicIdx
          proposalId
          rejectionCount
          status
          votes {
            nodes {
              action
              signer {
                signerValue
              }
            }
          }
        }
      }
    }
  `;

  return query;
};

export const getMultisigCreationExtrinsics = (
  extrinsicArray: {
    blockId: string;
    extrinsicIdx: number;
  }[],
) => {
  const extrinsicIds = extrinsicArray.map(
    ({ blockId, extrinsicIdx }) => `"${blockId}/${extrinsicIdx}"`,
  );
  const extrinsicFilter = `id: {in: [${extrinsicIds.join(',')}]}`;

  const query = gql`
    query {
      extrinsics(
        filter: {
          ${extrinsicFilter}
        }
        orderBy: CREATED_AT_DESC
      ) {
        totalCount
        nodes {
          params
          blockId
          extrinsicIdx
        }
      }
    }
  `;

  return query;
};

// export const historicalDistributionsQuery = ({
//   offset,
//   pageSize,
//   did,
// }: {
//   offset: number;
//   pageSize: number;
//   did: string;
// }) => {
//   const query = gql`
//     query {
//       events(
//         first: ${pageSize}
//         offset: ${offset}
//         orderBy: CREATED_AT_DESC
//         filter: {
//           moduleId: { equalTo: capitaldistribution }
//           eventId: { equalTo: BenefitClaimed }
//           attributes: {
//             contains: [
//               {
//                 value: "${did}"
//               }
//             ]
//           }
//         }
//       ) {
//         totalCount
//         pageInfo {
//           hasNextPage
//           hasPreviousPage
//         }
//         nodes {
//           id
//           blockId
//           moduleId
//           eventId
//           extrinsicIdx
//           attributes
//           block {
//             datetime
//           }
//         }
//       }
//     }
//   `;

//   return query;
// };
