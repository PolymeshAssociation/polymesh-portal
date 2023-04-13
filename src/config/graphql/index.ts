import { ApolloClient, InMemoryCache } from '@apollo/client';

export const gqlClient = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_ENDPIONT,
  cache: new InMemoryCache(),
});
