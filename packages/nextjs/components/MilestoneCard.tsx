import { useDistribute } from "~~/hooks/allo/useDistribute";

export const MilestoneCard = (props: { pool: any }) => {
  const { pool } = props;
  const milestones = pool.milestones;
  const { distribute } = useDistribute();

  const activeMilestone = milestones.findIndex(
    (milestone: any) =>
      milestone.status === "Pending" || milestone.status === "None" || milestone.status === "Rejected",
  );

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body p-5">
        <h2 className="card-title m-0">Milestone {activeMilestone + 1}</h2>
        <div>
          <p>{milestones[activeMilestone].description.description}</p>
        </div>
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={() => distribute(pool)}>
            Distribute
          </button>
          <button className="btn btn-primary">Reject</button>
        </div>
      </div>
    </div>
  );
};
