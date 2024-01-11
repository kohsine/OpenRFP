import { useRouter } from "next/router";
import { ZERO_ADDRESS } from "@allo-team/allo-v2-sdk/dist/Common/types";
import { useAccount } from "wagmi";

export const PreMilestoneTimeline = (props: { pool: any }) => {
  const { pool } = props;
  const { address } = useAccount();
  const router = useRouter();

  const isManager =
    pool.managerRole.accounts.filter((account: any) => account.account.id.toLowerCase() === address?.toLowerCase())
      .length > 0;

  return (
    <ul className="timeline">
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
        <button className="btn btn-sm btn-primary timeline-end" disabled>
          Deployed
        </button>
        <hr />
      </li>
      <li>
        <hr />
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
          disabled={pool.acceptedRecipientId !== ZERO_ADDRESS}
          onClick={() => router.push(`/pool/apply?p=${pool.id}`)}
        >
          Apply
        </button>
        <hr />
      </li>
      <li>
        <hr />
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
          disabled={pool.acceptedRecipientId !== ZERO_ADDRESS || !isManager}
          onClick={() => router.push(`/pool/applicants?p=${pool.id}`)}
        >
          Allocate
        </button>
        <hr />
      </li>
      <li>
        <hr />
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
          disabled={!isManager}
          onClick={() => router.push(`/pool/set_milestones?p=${pool.id}`)}
        >
          Set milestones
        </button>
      </li>
    </ul>
  );
};
