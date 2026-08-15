import { gql } from '@apollo/client';

export const transferEventsQuery = ({
  identityId,
  portfolioId,
  accountAddress = null,
  offset,
  pageSize,
  nonFungible,
}: {
  identityId: string;
  portfolioId: string | null;
  accountAddress?: string | null;
  offset: number;
  pageSize: number;
  nonFungible: boolean;
}) => {
  const id = portfolioId === 'default' ? '0' : portfolioId;

  const getOrFilter = () => {
    if (accountAddress) {
      return `or: [
            { fromAccount: {equalTo: "${accountAddress}"} }
            { toAccount: {equalTo: "${accountAddress}"} }
          ]`;
    }
    if (portfolioId !== null) {
      return `or: [
            { fromPortfolioId: {equalTo: "${identityId}/${id}"} }
            { toPortfolioId: {equalTo: "${identityId}/${id}"} }
          ]`;
    }
    return `or: [
            { fromIdentityId: {equalTo: "${identityId}"} }
            { toIdentityId: {equalTo: "${identityId}"} }
          ]`;
  };

  const orFilter = getOrFilter();

  const query = gql`
    query {
      assetTransactions(
        first: ${pageSize}
        offset: ${offset}
        orderBy: CREATED_EVENT_ID_DESC
        filter: {
          ${orFilter}
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
          toAccount
          fromAccount
          toIdentityId
          fromIdentityId
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
  identityId,
  type,
  accountAddress,
}: {
  offset: number;
  pageSize: number;
  portfolioNumber?: string;
  identityId?: string | null;
  type: string;
  accountAddress?: string | null;
}) => {
  const assetDetail = type === 'Fungible' ? 'amount' : 'nftIds';

  const getFilterClause = () => {
    if (accountAddress) {
      return `or: [
            { fromAccount: { equalTo: "${accountAddress}" } }
            { toAccount: { equalTo: "${accountAddress}" } }
          ]`;
    }
    if (identityId) {
      return `identityId: { equalTo: "${identityId}" }`;
    }
    return `or: [
            { fromId: { startsWith: "${portfolioNumber}" } }
            { toId: { startsWith: "${portfolioNumber}" } }
          ]`;
  };

  const filterClause = getFilterClause();

  const query = gql`
    query {
      portfolioMovements(
        first: ${pageSize}
        offset: ${offset}
        orderBy: CREATED_BLOCK_ID_DESC
        filter: {
          type: { equalTo: ${type} }
          ${filterClause}
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
          fromAccount
          from {
            identityId
            number
            name
          }
          toId
          toAccount
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
      orderBy: CREATED_EVENT_ID_DESC
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
        orderBy: CREATED_EVENT_ID_DESC
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
          createdEvent {
            eventIdx
          }
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
}: {
  multisigId: string;
  ids?: number[];
  isHistorical?: boolean;
  offset?: number;
  pageSize?: number;
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
        orderBy: CREATED_EVENT_ID_DESC
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
          createdEvent {
            extrinsic {
              params
              extrinsicIdx
            }
          }
        }
      }
    }
  `;

  return query;
};
