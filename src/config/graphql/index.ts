import { ApolloClient, InMemoryCache } from '@apollo/client';

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        portfolioMovements: {
          keyArgs: ['portfolioNumber'],
          merge: (previousResult, fetchMoreResult, { variables }) => {
            const { offset = 0 } = variables as { offset: number };
            const isNewResultSet =
              previousResult &&
              previousResult.totalCount !== fetchMoreResult.totalCount;
            let merged = [];

            if (isNewResultSet) {
              for (let i = 0; i < fetchMoreResult.nodes.length; i += 1) {
                merged[i] = fetchMoreResult.nodes[i];
              }
            } else {
              merged = previousResult ? previousResult.nodes.slice(0) : [];
              for (let i = 0; i < fetchMoreResult.nodes.length; i += 1) {
                merged[offset + i] = fetchMoreResult.nodes[i];
              }
            }
            return {
              ...fetchMoreResult,
              nodes: merged,
            };
          },
          read: (existing, { variables }) => {
            const { offset, pageSize } = variables as {
              offset: number;
              pageSize: number;
              portfolioNumber: string;
            };
            if (!existing) {
              return undefined;
            }

            const updated = {
              ...existing,
              nodes: existing.nodes.slice(offset, offset + pageSize),
            };

            return updated;
          },
        },
        events: {
          keyArgs: ['did'],
          merge: (previousResult, fetchMoreResult, { variables }) => {
            const { offset = 0 } = variables as { offset: number };
            const isNewResultSet =
              previousResult &&
              previousResult.totalCount !== fetchMoreResult.totalCount;
            let merged = [];

            if (isNewResultSet) {
              for (let i = 0; i < fetchMoreResult.nodes.length; i += 1) {
                merged[i] = fetchMoreResult.nodes[i];
              }
            } else {
              merged = previousResult ? previousResult.nodes.slice(0) : [];
              for (let i = 0; i < fetchMoreResult.nodes.length; i += 1) {
                merged[offset + i] = fetchMoreResult.nodes[i];
              }
            }
            return {
              ...fetchMoreResult,
              nodes: merged,
            };
          },
          read: (existing, { variables }) => {
            const { offset, pageSize } = variables as {
              offset: number;
              pageSize: number;
              did: string;
            };

            if (!existing) {
              return undefined;
            }

            const updated = {
              ...existing,
              nodes: existing.nodes.slice(offset, offset + pageSize),
            };

            return updated;
          },
        },
      },
    },
  },
});

export const gqlClient = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_ENDPIONT,
  cache,
});
