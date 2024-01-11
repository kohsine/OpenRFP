import { Allo } from "@allo-team/allo-v2-sdk";

const allo = new Allo({ chain: 421614, rpc: "https://sepolia-rollup.arbitrum.io/rpc" });

export const useAllo = () => {
  return { allo };
};
