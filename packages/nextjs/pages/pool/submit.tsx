import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { writeContract } from "@wagmi/core";
import type { NextPage } from "next";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getStrategy } from "~~/utils/graphql";
import { uploadJson } from "~~/utils/ipfs";

const SubmitMilestone: NextPage = () => {
  const router = useRouter();
  const alloRfpSimpleInfo = useDeployedContractInfo("allo_rfp_simple");
  const [poolId, setPoolId] = useState<string>("");
  const [work, setWork] = useState<string>("");

  useEffect(() => {
    if (!(router.query.p instanceof Array)) setPoolId(router.query.p ?? "");
  }, [router.query.p]);

  async function submitMilestone() {
    const ipfsHash = await uploadJson({ description: work });
    const strategy = await getStrategy(poolId);

    if (!alloRfpSimpleInfo.data) throw new Error("allo rfp data undefined");
    await writeContract({
      address: strategy ?? "",
      abi: alloRfpSimpleInfo.data.abi,
      functionName: "submitUpcomingMilestone",
      args: [{ protocol: 1n, pointer: ipfsHash }],
    });
  }

  return (
    <div className="flex flex-grow flex-col bg-base-300 px-8 py-24 items-center">
      <div className="px-5 mb-14">
        <h1 className="text-center">
          <span className="block text-2xl font-bold">Submit milestone</span>
        </h1>
        <p className="text-center text-lg">Submit work for a milestone</p>
      </div>
      <div className="flex justify-center items-center gap-4 flex-col w-full lg:w-1/2 xl:w-2/3 2xl:w-5/12">
        <input
          type="text"
          placeholder="Pool ID"
          value={poolId}
          className="input w-full"
          onChange={e => setPoolId(e.target.value)}
        />
        <textarea
          placeholder="Proof of work"
          className="textarea w-full h-[20vh]"
          onChange={e => setWork(e.target.value)}
        ></textarea>
        <button className="btn btn-md btn-primary w-full" onClick={() => submitMilestone()}>
          Submit Milestone
        </button>
      </div>
    </div>
  );
};

export default SubmitMilestone;
