import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MilestoneCard } from "~~/components/MilestoneCard";
import { PoolContext } from "~~/context/PoolContext";

const ReviewMilestone = () => {
  const router = useRouter();
  const [poolId, setPoolId] = useState<string>("");
  const { pools } = useContext(PoolContext);
  const pool = pools.find(pool => pool.id === poolId);

  useEffect(() => {
    setPoolId(router.query.p?.toString() ?? "");
  }, [router.query.p]);

  console.log("pool id", poolId);

  return (
    <div className="flex flex-col flex-grow bg-base-300 w-full px-8 py-24 items-center">
      <div className="px-5 mb-14">
        <h1 className="text-center">
          <span className="block text-2xl font-bold">Review milestone</span>
        </h1>
        <p className="text-center text-lg">Accept or reject a milestone</p>
      </div>
      <div className="flex flex-col justify-center items-center gap-8 w-full lg:w-2/3">
        <div className="flex w-1/2 flex-grow gap-2">
          <input
            type="text"
            value={poolId}
            placeholder="Pool ID"
            className="input w-full flex-1"
            onChange={e => setPoolId(e.target.value)}
          />
          <button className="btn btn-primary" disabled={!poolId}>
            Show milestones
          </button>
        </div>

        {pool && <MilestoneCard pool={pool}></MilestoneCard>}
      </div>
    </div>
  );
};

export default ReviewMilestone;
