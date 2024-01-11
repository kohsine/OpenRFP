import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ZERO_ADDRESS } from "@allo-team/allo-v2-sdk/dist/Common/types";
import { createPublicClient, decodeAbiParameters, http, parseAbiItem, parseAbiParameters } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { useAccount } from "wagmi";
import { ApplicantCard } from "~~/components/ApplicantCard";
import { ALLO_DEPLOYED_BLOCK } from "~~/constants/constants";
import { getStrategy } from "~~/utils/graphql";
import { fetchJson } from "~~/utils/ipfs";

export interface Applicant {
  recipient: string;
  bid: bigint;
  description: string;
}

const Applicants = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [applicants, setApplicants] = useState<Applicant[] | undefined>(undefined);
  const [poolId, setPoolId] = useState<string>("");
  const [firstLoad, setFirstLoad] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const routerPoolId = router.query.p?.toString();
  useEffect(() => {
    if (routerPoolId) setPoolId(routerPoolId);
  }, [routerPoolId]);

  const listApplicants = useCallback(async (poolId: string) => {
    if (poolId) {
      try {
        setLoading(true);
        const strategy: string | undefined = await getStrategy(poolId);

        const client = createPublicClient({
          chain: arbitrumSepolia,
          transport: http("https://sepolia-rollup.arbitrum.io/rpc"),
        });

        const logs = await client.getLogs({
          address: strategy,
          event: parseAbiItem("event Registered(address indexed recipientId, bytes data, address sender)"),
          fromBlock: BigInt(ALLO_DEPLOYED_BLOCK),
        });

        const applicants: Applicant[] = await Promise.all(
          logs.map(async log => {
            const [, , bid, [, hash]] = decodeAbiParameters(
              parseAbiParameters("address, address, uint256, (uint256, string)"),
              log.args.data!,
            );

            const { description } = await fetchJson(hash);

            return {
              recipient: log.args.recipientId ?? ZERO_ADDRESS,
              bid,
              description,
            };
          }),
        );
        console.log("applicants", applicants);
        setApplicants(applicants);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (firstLoad && routerPoolId) {
      listApplicants(routerPoolId);
      setFirstLoad(false);
      setSearch(routerPoolId);
    }
  }, [firstLoad, listApplicants, routerPoolId]);

  return (
    <div className="flex flex-col flex-grow bg-base-300 w-full px-8 py-24 items-center">
      <div className="px-5 mb-14">
        <h1 className="text-center">
          <span className="block text-2xl font-bold">List proposals</span>
        </h1>
        <p className="text-center text-lg">List all the proposals for a pool</p>
      </div>
      <div className="flex flex-col justify-center items-center gap-4 w-full lg:w-1/2 xl:w-2/3 2xl:w-5/12">
        <div className="flex flex-row w-full gap-4">
          <input
            type="text"
            value={poolId}
            placeholder="Pool ID"
            className="input w-full"
            onChange={e => setPoolId(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              listApplicants(poolId);
              setSearch(poolId);
            }}
            disabled={!poolId}
          >
            {loading ? <span className="loading loading-spinner"></span> : "List applicants"}
          </button>
        </div>
        {applicants?.map(applicant => {
          return (
            <ApplicantCard
              key={applicant.recipient}
              applicant={applicant}
              onClickAllocate={() => router.push(`/pool/allocate?p=${poolId}&r=${address}`)}
            ></ApplicantCard>
          );
        })}
        {applicants && applicants.length === 0 && !loading && <p>No applicants for pool {search} :(</p>}
      </div>
    </div>
  );
};

export default Applicants;
