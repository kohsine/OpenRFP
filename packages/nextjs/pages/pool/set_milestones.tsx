import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { writeContract } from "@wagmi/core";
import { parseEther } from "viem";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getStrategy } from "~~/utils/graphql";
import { uploadJson } from "~~/utils/ipfs";

export interface Milestone {
  percentage: string;
  description: string;
}

export interface MilestoneContract {
  amountPercentage: bigint;
  metadata: {
    protocol: bigint;
    pointer: string;
  };
  milestoneStatus: number;
}

const SetMilestones = () => {
  const router = useRouter();
  const [poolId, setPoolId] = useState<string>("");
  const [milestones, setMilestones] = useState<Milestone[]>([{ percentage: "", description: "" }]);
  const alloRfpSimpleInfo = useDeployedContractInfo("allo_rfp_simple");

  useEffect(() => {
    if (!(router.query.p instanceof Array)) setPoolId(router.query.p ?? "");
  }, [router.query.p]);

  async function _setMilestones() {
    const mappedMilestones = await Promise.all(
      milestones.map(async (milestone): Promise<MilestoneContract> => {
        const hash = await uploadJson({ description: milestone.description });
        return {
          amountPercentage: parseEther((parseInt(milestone.percentage) / 100).toString()),
          metadata: { protocol: 1n, pointer: hash },
          milestoneStatus: 0,
        };
      }),
    );

    const strategy = await getStrategy(poolId);

    if (!alloRfpSimpleInfo.data) throw new Error("allo rfp data undefined");
    await writeContract({
      address: strategy ?? "",
      abi: alloRfpSimpleInfo.data.abi,
      functionName: "setMilestones",
      args: [mappedMilestones],
    });
  }

  return (
    <div className="flex flex-col flex-grow bg-base-300 w-full px-8 py-12 items-center">
      <div className="px-5 mb-14">
        <h1 className="text-center">
          <span className="block text-2xl font-bold">Set milestones</span>
        </h1>
        <p className="text-center text-lg">Recipients will receive payouts (upon approval) after hitting milestones</p>
      </div>
      <div className="flex flex-col justify-center items-center gap-8 w-full lg:w-1/2 xl:w-2/3 2xl:w-5/12">
        <input
          type="text"
          placeholder="Pool ID"
          value={poolId}
          className="input w-full"
          onChange={e => setPoolId(e.target.value)}
        />
        {milestones.map((milestone, index) => {
          return (
            <div key={index} className="flex flex-col w-full gap-2">
              <input
                type="text"
                placeholder={`Milestone ${index + 1} percentage`}
                className="input w-full"
                onChange={e =>
                  setMilestones(oldMilestones => {
                    const milestone = oldMilestones[index];
                    milestone.percentage = e.target.value;
                    const newMilestones = [...oldMilestones];
                    newMilestones[index] = milestone;
                    return newMilestones;
                  })
                }
              />
              <input
                type="text"
                placeholder={`Milestone ${index + 1} description`}
                className="input w-full"
                onChange={e =>
                  setMilestones(oldMilestones => {
                    const milestone = oldMilestones[index];
                    milestone.description = e.target.value;
                    const newMilestones = [...oldMilestones];
                    newMilestones[index] = milestone;
                    return newMilestones;
                  })
                }
              />
            </div>
          );
        })}
        <div className="flex flex-col w-full gap-4">
          <div className="flex w-full gap-4">
            <button
              className="btn btn-md btn-secondary flex-grow"
              onClick={() => setMilestones(old => [...old, { percentage: "", description: "" }])}
            >
              Add milestone
            </button>
            <button
              className="btn btn-md btn-secondary flex-grow"
              onClick={() =>
                setMilestones(old => {
                  return old.slice(0, -1);
                })
              }
            >
              Remove milestone
            </button>
          </div>
          <button className="btn btn-md btn-primary w-full" onClick={_setMilestones}>
            Set milestones
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetMilestones;
