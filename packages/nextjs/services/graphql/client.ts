import { ApolloClient, InMemoryCache } from "@apollo/client";

export const apolloClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/allo-protocol/allo-v2-arbitrum-sepolia",
  cache: new InMemoryCache(),
});
