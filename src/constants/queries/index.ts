import { gql } from '@apollo/client';

export const getAssetTransferEvents = gql`
  query transferEvents($did: String!) {
    events(
      orderBy: CREATED_AT_DESC
      filter: {
        moduleId: { equalTo: asset }
        eventId: { equalTo: Transfer }
        attributes: { contains: [{ value: { did: $did } }] }
      }
    ) {
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

export const getPaginatedAssetTransferEvents = gql`
  query transferEvents($did: String!, $offset: Int!, $pageSize: Int!) {
    events(
      first: $pageSize
      offset: $offset
      orderBy: CREATED_AT_DESC
      filter: {
        moduleId: { equalTo: asset }
        eventId: { equalTo: Transfer }
        attributes: { contains: [{ value: { did: $did } }] }
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

export const getExtrinsicTimestamp = gql`
  query extrinsics($id: String!) {
    extrinsics(filter: { id: { equalTo: $id } }) {
      nodes {
        block {
          datetime
        }
      }
    }
  }
`;

export const getTimestampByBlockHash = gql`
  query getTimestamp($hash: String!) {
    blocks(filter: { hash: { equalTo: $hash } }) {
      nodes {
        datetime
      }
    }
  }
`;

export const getPortfolioMovements = gql`
  query portfolioMovementsQuery(
    $offset: Int!
    $pageSize: Int!
    $portfolioNumber: String!
  ) {
    portfolioMovements(
      first: $pageSize
      offset: $offset
      orderBy: CREATED_AT_DESC
      filter: {
        or: [
          { fromId: { startsWith: $portfolioNumber } }
          { toId: { startsWith: $portfolioNumber } }
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

export const getMultisigProposalsQuery = ({
  multisigId,
  offset,
  pageSize,
  activeOnly = true,
}: {
  multisigId: string;
  activeOnly?: boolean;
  offset?: number;
  pageSize?: number;
}) => {
  const statusFilter = activeOnly
    ? `status: { equalTo: Active }`
    : 'status: { notEqualTo: Active }';
  const offsetFiler = offset ? `offset: ${offset}` : '';
  const pageSizeFilter = pageSize ? `first: ${pageSize}` : '';
  const query = gql`
    query {
      multiSigProposals(
        ${offsetFiler}
        ${pageSizeFilter}
        filter: {
          multisigId: { equalTo: "${multisigId}" }
          ${statusFilter}
        }
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
