import { gql } from '@apollo/client';

export const transferEventsQuery = ({
  identityId,
  portfolioId,
  offset,
  pageSize,
  nonFungible,
}: {
  identityId: string;
  portfolioId: string | null;
  offset: number;
  pageSize: number;
  nonFungible: boolean;
}) => {
  const id = portfolioId === 'default' ? '0' : portfolioId;
  const query = gql`
    query {
      assetTransactions(
        first: ${pageSize}
        offset: ${offset}
        orderBy: CREATED_AT_DESC
        filter: {
          or: [
            {fromPortfolioId: 
              ${
                portfolioId === null
                  ? `{startsWith: "${identityId}"}`
                  : `{equalTo: "${identityId}/${id}"}`
              }
            }
            {toPortfolioId:
              ${
                portfolioId === null
                  ? `{startsWith: "${identityId}"}`
                  : `{equalTo: "${identityId}/${id}"}`
              }
            }
          ]
          amount: {
            isNull: ${nonFungible}
          }
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
          amount
          asset {
            name
            ticker
          }
          assetId
          nftIds
          datetime
          id
          createdBlockId
          extrinsicIdx
          eventIdx
          eventId
          toPortfolioId
          fromPortfolioId
          instructionId
          instructionMemo
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
  type,
}: {
  offset: number;
  pageSize: number;
  portfolioNumber: string;
  type: string;
}) => {
  const assetDetail = type === 'Fungible' ? 'amount' : 'nftIds';

  const query = gql`
    query {
      portfolioMovements(
        first: ${pageSize}
        offset: ${offset}
        orderBy: CREATED_AT_DESC
        filter: {
          type: { equalTo: ${type} }
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
          asset {
            name
            ticker
          }
          ${assetDetail}
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
            currency {
             id
             ticker
            }
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
    ? `stashAccount: {equalTo: "${accountRawKey}" }`
    : '';
  const identityFilter = identityId
    ? `identityId: {equalTo: "${identityId}" }`
    : '';

  const query = gql`
    query {
      stakingEvents(
        first: ${pageSize}
        offset: ${offset}
        orderBy: CREATED_AT_DESC
        filter: {
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
          createdBlockId
          eventId
          identityId
          stashAccount
          amount
          datetime
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
  isHistorical = false,
}: {
  multisigId: string;
  ids?: number[];
  isHistorical?: boolean;
  offset?: number;
  pageSize?: number;
}) => {
  const offsetFiler = offset ? `offset: ${offset}` : '';
  const pageSizeFilter = pageSize ? `first: ${pageSize}` : '';

  let isActiveFilter = '';
  if (isHistorical) {
    isActiveFilter = `status: { notEqualTo: "Active" }`;
  }

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
          ${idFilter}
          ${isActiveFilter}
        }
        orderBy: PROPOSAL_ID_DESC
      ) {
        totalCount
        nodes {
          updatedBlockId
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
