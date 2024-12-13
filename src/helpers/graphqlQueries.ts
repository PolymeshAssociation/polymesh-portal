import { gql } from '@apollo/client';

export const transferEventsQuery = ({
  identityId,
  portfolioId,
  offset,
  pageSize,
  nonFungible,
  paddedIds,
}: {
  identityId: string;
  portfolioId: string | null;
  offset: number;
  pageSize: number;
  nonFungible: boolean;
  paddedIds: boolean;
}) => {
  const id = portfolioId === 'default' ? '0' : portfolioId;
  const query = gql`
    query {
      assetTransactions(
        first: ${pageSize}
        offset: ${offset}
        orderBy: ${paddedIds ? 'CREATED_EVENT_ID_DESC' : 'CREATED_AT_DESC'}
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
          createdBlock {
            blockId
          }
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
  paddedIds,
}: {
  offset: number;
  pageSize: number;
  portfolioNumber: string;
  type: string;
  paddedIds: boolean;
}) => {
  const assetDetail = type === 'Fungible' ? 'amount' : 'nftIds';

  const query = gql`
    query {
      portfolioMovements(
        first: ${pageSize}
        offset: ${offset}
        orderBy: ${paddedIds ? 'CREATED_BLOCK_ID_DESC' : 'CREATED_AT_DESC'}
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
  paddedIds,
}: {
  offset: number;
  pageSize: number;
  did: string;
  paddedIds: boolean;
}) => {
  const query = gql`
  query {
    distributionPayments(
      first: ${pageSize}
      offset: ${offset}
      orderBy: ${paddedIds ? 'CREATED_EVENT_ID_DESC' : 'CREATED_AT_DESC'}
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
          id
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
          createdBlock {
            blockId
            datetime
          }
          eventId
          nodeId
          updatedBlock {
            blockId
            datetime
          }
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
  paddedIds,
}: {
  offset: number;
  pageSize: number;
  accountRawKey?: string;
  identityId?: string;
  paddedIds: boolean;
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
        orderBy: ${paddedIds ? 'CREATED_EVENT_ID_DESC' : 'CREATED_AT_DESC'}
        filter: {
          eventId: { in: [Reward, Rewarded] }
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
          ${paddedIds ? 'createdEvent { eventIdx }' : ''}
          createdBlock {
            blockId
          }
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
  paddedIds,
}: {
  multisigId: string;
  ids?: number[];
  isHistorical?: boolean;
  offset?: number;
  pageSize?: number;
  paddedIds?: boolean;
}) => {
  const offsetFilter = offset ? `offset: ${offset}` : '';
  const pageSizeFilter = pageSize ? `first: ${pageSize}` : '';
  const isActiveFilter = isHistorical ? `status: { notEqualTo: "Active" }` : '';
  const idFilter =
    ids.length > 0 ? `proposalId: { in: [${ids.join(',')}] }` : '';

  const query = gql`
    query {
      multiSigProposals(
        ${offsetFilter}
        ${pageSizeFilter}
        filter: {
          multisigId: { equalTo: "${multisigId}" }
          ${idFilter}
          ${isActiveFilter}
        }
        orderBy: ${paddedIds ? 'CREATED_EVENT_ID_DESC' : 'PROPOSAL_ID_DESC'}
      ) {
        totalCount
        nodes {
          updatedBlock {
            blockId
          }
          approvalCount
          createdBlock {
            blockId
          }
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
          ${
            paddedIds
              ? `
              createdEvent {
                extrinsic {
                  params
                  extrinsicIdx
                }
              }`
              : ''
          }
        }
      }
    }
  `;

  return query;
};

// TODO: Can be removed after SUbQuery v19 update along with paddedIds
export const getMultisigCreationExtrinsics = ({
  extrinsicArray,
}: {
  extrinsicArray: {
    blockId: number;
    extrinsicIdx: number;
  }[];
}) => {
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
          block {
            id
            blockId
          }
          extrinsicIdx
        }
      }
    }
  `;

  return query;
};
