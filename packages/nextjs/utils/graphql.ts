import { gql } from "@apollo/client";
import { apolloClient } from "~~/services/graphql/client";

const GET_STRATEGY = gql`
  query GetStrategy($id: ID!) {
    pool(id: $id) {
      strategy
    }
  }
`;

export async function getStrategy(poolId: string): Promise<string | undefined> {
  const res = await apolloClient.query({ query: GET_STRATEGY, variables: { id: poolId } });
  return res.data.pool?.strategy;
}
