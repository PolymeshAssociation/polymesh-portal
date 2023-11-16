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
    const idFilters = ids.map((id) => `{proposalId: { equalTo: ${id} }}`);
    idFilter = `or: [${idFilters.join(',')}]`;
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
  const extrinsicFilters = extrinsicArray.map(
    ({ blockId, extrinsicIdx }) =>
      `{ and: [
          {blockId: { equalTo: "${blockId}" }}
          {extrinsicIdx: { equalTo: ${extrinsicIdx} }}
        ] }`,
  );
  const extrinsicFilter = `or: [${extrinsicFilters.join(',')}]`;

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
