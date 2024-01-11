import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { MilestoneFromContract } from "~~/hooks/allo/usePools";

export const PostMilestoneTimeline = (props: { pool: any; milestones: MilestoneFromContract[] }) => {
  const { pool, milestones } = props;
  const router = useRouter();
  const { address } = useAccount();

  const completed = milestones.every(milestone => milestone.status === "Accepted");

  const activeMilestone = completed
    ? milestones.length - 1
    : milestones.findIndex(
        milestone => milestone.status === "Pending" || milestone.status === "None" || milestone.status === "Rejected",
      );

  const isManager =
    pool.managerRole.accounts.filter((account: any) => account.account.id.toLowerCase() === address?.toLowerCase())
      .length > 0;

  return (
    <ul className="timeline">
      {activeMilestone === 0 && (
        <li>
          <div className="timeline-middle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <button
            className="btn btn-sm btn-primary timeline-end"
            disabled={milestones.length > 0 && milestones[0].status != "None"}
          >
            Set milestones
          </button>
          <hr />
        </li>
      )}
      <li>
        {activeMilestone === 0 && <hr />}
        <div className="timeline-start">Milestone {activeMilestone + 1}</div>
        <div className="timeline-middle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <button
          className="btn btn-sm btn-primary timeline-end"
          disabled={milestones[activeMilestone].status === "Accepted"}
          onClick={() => router.push(`/pool/submit?p=${pool.id}`)}
        >
          Submit milestone
        </button>
        <hr />
      </li>
      <li>
        <hr />
        <div className="timeline-start">Status: {milestones[activeMilestone].status}</div>
        <div className="timeline-middle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="timeline-end flex flex-col gap-1">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => router.push(`/pool/review_milestone?p=${pool.id}`)}
            disabled={!isManager || milestones[activeMilestone].status === "Accepted"}
          >
            Review
          </button>
        </div>
        {milestones[activeMilestone].status === "Accepted" && <hr />}
      </li>
      {milestones[activeMilestone].status === "Accepted" && (
        <li>
          <hr />
          <div className="timeline-start px-5">Completed</div>
          <div className="timeline-middle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </li>
      )}
    </ul>
  );
};
