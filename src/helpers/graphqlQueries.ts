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
            { fromAccountId: {equalTo: "${accountAddress}"} }
            { toAccountId: {equalTo: "${accountAddress}"} }
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
          id
          createdEvent {
            eventIdx
            extrinsicIdx
            block {
              blockId
              datetime
            }
          }
          eventId
          toPortfolioId
          fromPortfolioId
          toAccountId
          fromAccountId
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

// Movements are the internal transfers that no instruction made
export const portfolioMovementsQuery = ({
  offset,
  pageSize,
  portfolioNumber,
  identityId,
  nonFungible,
  accountAddress,
}: {
  offset: number;
  pageSize: number;
  portfolioNumber?: string;
  identityId?: string | null;
  nonFungible: boolean;
  accountAddress?: string | null;
}) => {
  const assetDetail = nonFungible ? 'nftIds' : 'amount';

  const getFilterClause = () => {
    if (accountAddress) {
      return `or: [
            { fromAccountId: { equalTo: "${accountAddress}" } }
            { toAccountId: { equalTo: "${accountAddress}" } }
          ]`;
    }
    // A portfolio number is `did/number`, or the bare DID when no portfolio is selected
    const portfolioIdentity =
      portfolioNumber && !portfolioNumber.includes('/')
        ? portfolioNumber
        : null;
    if (identityId || portfolioIdentity) {
      const did = identityId || portfolioIdentity;
      return `or: [
            { fromIdentityId: { equalTo: "${did}" } }
            { toIdentityId: { equalTo: "${did}" } }
          ]`;
    }
    return `or: [
            { fromPortfolioId: { equalTo: "${portfolioNumber}" } }
            { toPortfolioId: { equalTo: "${portfolioNumber}" } }
          ]`;
  };

  const filterClause = getFilterClause();

  const query = gql`
    query {
      assetTransactions(
        first: ${pageSize}
        offset: ${offset}
        orderBy: CREATED_EVENT_ID_DESC
        filter: {
          isInternalTransfer: { equalTo: true }
          amount: { isNull: ${nonFungible} }
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
          fromPortfolioId
          fromAccountId
          fromPortfolio {
            name
          }
          toPortfolioId
          toAccountId
          toPortfolio {
            name
          }
          assetId
          asset {
            name
            ticker
          }
          ${assetDetail}
          memo
          createdEvent {
            block {
              blockId
              datetime
            }
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
          createdEvent {
            eventIdx
            block {
              blockId
              datetime
            }
          }
          nodeId
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
    ? `stashId: {equalTo: "${accountRawKey}" }`
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
            block {
              blockId
              datetime
            }
          }
          eventId
          identityId
          stashId
          amount
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
          updatedEvent {
            block {
              blockId
            }
          }
          approvalCount
          creatorAccountId
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
            block {
              blockId
              datetime
            }
            extrinsic {
              args
              extrinsicIdx
            }
          }
        }
      }
    }
  `;

  return query;
};
