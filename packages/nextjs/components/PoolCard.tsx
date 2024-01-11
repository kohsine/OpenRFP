import { PostMilestoneTimeline } from "./PostMilestoneTimeline";
import { PreMilestoneTimeline } from "./PreMilestoneTimeline";
import { ZERO_ADDRESS } from "@allo-team/allo-v2-sdk/dist/Common/types";
import { formatEther } from "viem";

export const PoolCard = (props: { pool: any }) => {
  const { pool } = props;

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body p-5">
        <h2 className="card-title m-0">
          Pool {pool.id}
          {pool.acceptedRecipientId === ZERO_ADDRESS ? (
            <div className="badge badge-primary">Open</div>
          ) : pool.acceptedRecipientId !== ZERO_ADDRESS &&
            pool.milestones.length > 0 &&
            pool.milestones.every((milestone: any) => milestone.status === "Accepted") ? (
            <div className="badge badge-secondary">Completed</div>
          ) : (
            <div className="badge badge-neutral">Allocated</div>
          )}
        </h2>
        <div>
          <p className="m-0">Last updated: {new Date(parseInt(pool.updatedAt) * 1000).toLocaleString()}</p>
          <p className="m-0">Amount (ETH): {formatEther(pool.amount)}</p>
          <p>{pool.json.description}</p>
          {pool.milestones.map((milestone: any, i: number) => {
            return (
              <p key={i}>
                Milestone {i + 1}: {milestone.description.description}
              </p>
            );
          })}
        </div>
        <div className="card-actions justify-end">
          {pool.milestones.length === 0 || pool.acceptedRecipientId === ZERO_ADDRESS ? (
            <PreMilestoneTimeline pool={pool}></PreMilestoneTimeline>
          ) : (
            <PostMilestoneTimeline pool={pool} milestones={pool.milestones}></PostMilestoneTimeline>
          )}
        </div>
      </div>
    </div>
  );
};
