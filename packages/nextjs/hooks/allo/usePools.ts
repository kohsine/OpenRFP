import { useCallback, useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { readContract, readContracts } from "@wagmi/core";
import { formatEther, parseAbiItem } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { ALLO_DEPLOYED_BLOCK } from "~~/constants/constants";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth/useDeployedContractInfo";
import { getStrategy } from "~~/utils/graphql";
import { fetchJson } from "~~/utils/ipfs";

const GET_POOLS = gql`
  query GetPools {
    pools(first: 1000, orderBy: updatedAt, orderDirection: desc) {
      id
      amount
      token
      metadata {
        pointer
        protocol
      }
      updatedAt
      createdAt
      managerRole {
        accounts {
          account {
            id
          }
        }
      }
      adminRole {
        accounts {
          account {
            id
          }
        }
      }
      strategy
    }
  }
`;

export const STATUSES: Record<number, string> = {
  0: "None",
  1: "Pending",
  2: "Accepted",
  3: "Rejected",
} as const;

export interface MilestoneFromContract {
  percentage: number;
  description: string;
  status: string;
}

const RFP_STRATEGY_ID = "0x0d459e12d9e91d2b2a8fa12be8c7eb2b4f1c35e74573990c34b436613bc2350f";

export const usePools = () => {
  const {
    data,
    loading: graphLoading,
    refetch: graphRefetch,
  } = useQuery(GET_POOLS, {
    notifyOnNetworkStatusChange: true,
  });
  const { address } = useAccount();
  const [pools, setPools] = useState<any[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [managedPools, setManagedPools] = useState<any[]>([]);
  const alloRfpSimpleInfo = useDeployedContractInfo("allo_rfp_simple");
  const publicClient = usePublicClient();

  const mapStrategyId = useCallback(
    async (pools: any[]) => {
      const calls = pools.map(pool => {
        return { abi: alloRfpSimpleInfo.data!.abi, address: pool.strategy, functionName: "getStrategyId" };
      });
      const data = await readContracts({ contracts: calls });
      const newPools = pools.map((pool, i) => {
        return { ...pool, strategyId: data[i].result };
      });
      return newPools;
    },
    [alloRfpSimpleInfo.data],
  );

  function filterStrategies(pools: any[]) {
    return pools.filter(pool => pool.strategyId === RFP_STRATEGY_ID);
  }

  const filterManaged = useCallback(
    (pools: any[]) => {
      return pools.filter(
        pool =>
          pool.managerRole.accounts.filter(
            (account: any) => account.account.id.toLowerCase() === address?.toLowerCase(),
          ).length > 0,
      );
    },
    [address],
  );

  const mapAcceptedRecipient = useCallback(
    (pools: any[]) => {
      const newPools: Promise<any>[] = [];
      pools.forEach((pool: any) => {
        newPools.push(
          readContract({
            abi: alloRfpSimpleInfo.data!.abi,
            address: pool.strategy,
            functionName: "acceptedRecipientId",
          }).then(address => {
            return { ...pool, acceptedRecipientId: address };
          }),
        );
      });
      return Promise.all(newPools);
    },
    [alloRfpSimpleInfo.data],
  );

  function mapDescription(pools: any[]) {
    const newPools: Promise<any>[] = [];
    pools.forEach((pool: any) => {
      // special condition because I used a random ipfs hash which is now causing errors
      if (
        pool.metadata.pointer &&
        pool.metadata.pointer !== "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi"
      ) {
        newPools.push(
          fetchJson(pool.metadata.pointer)
            .then(json => {
              return { ...pool, json };
            })
            .catch(() => {
              return { ...pool };
            }),
        );
      }
    });
    return Promise.all(newPools);
  }

  const getMilestones = useCallback(
    async (poolId: string): Promise<MilestoneFromContract[]> => {
      const strategy = await getStrategy(poolId);
      if (!strategy) throw new Error("strategy is undefined");
      const logs = await publicClient.getLogs({
        address: strategy,
        event: parseAbiItem("event MilestonesSet(uint256 milestonesLength)"),
        fromBlock: BigInt(ALLO_DEPLOYED_BLOCK),
      });
      if (logs.length > 0) {
        const recent = logs.pop();
        const milestonesLength = recent?.args.milestonesLength ?? 0n;

        const milestones = [];
        for (let i = 0; i < milestonesLength; i++) {
          if (alloRfpSimpleInfo.data) {
            const milestone = await readContract({
              address: strategy,
              abi: alloRfpSimpleInfo.data.abi,
              functionName: "milestones",
              args: [BigInt(i)],
            });
            const description = await fetchJson(milestone[1].pointer);
            milestones.push({
              percentage: parseInt(formatEther(milestone[0])) * 100,
              description,
              status: STATUSES[milestone[2]],
            });
          }
        }
        return milestones;
      }
      return [];
    },
    [alloRfpSimpleInfo.data, publicClient],
  );

  const mapMilestones = useCallback(
    (pools: any[]): Promise<any[]> => {
      return Promise.all(
        pools.map(async pool => {
          return { ...pool, milestones: await getMilestones(pool.id) };
        }),
      );
    },
    [getMilestones],
  );

  const mapPools = useCallback(async () => {
    setFilterLoading(true);
    mapStrategyId(data.pools).then(strategyIdPools => {
      const filteredStrategies = filterStrategies(strategyIdPools);
      mapAcceptedRecipient(filteredStrategies).then(acceptedRecipientPools => {
        mapDescription(acceptedRecipientPools).then(descriptionPools => {
          mapMilestones(descriptionPools)
            .then(milestonePools => {
              setPools(milestonePools);
              setManagedPools(filterManaged(milestonePools));
            })
            .finally(() => {
              setFilterLoading(false);
            });
        });
      });
    });
  }, [data?.pools, filterManaged, mapAcceptedRecipient, mapMilestones, mapStrategyId]);

  useEffect(() => {
    if (data && alloRfpSimpleInfo.data) {
      mapPools();
    }
  }, [alloRfpSimpleInfo.data, data, mapPools]);

  async function refetch() {
    setFilterLoading(true);
    const milestonePools = await mapMilestones(pools);
    setPools(milestonePools);
    setManagedPools(filterManaged(milestonePools));
    setFilterLoading(false);
    await graphRefetch();
  }

  return { pools, loading: graphLoading || filterLoading, managedPools, refetch };
};
