import { gql } from '@apollo/client';

export const getAssetTransferEvents = gql`
  query transferEvents($did: String!) {
    events(
      orderBy: BLOCK_ID_DESC
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
