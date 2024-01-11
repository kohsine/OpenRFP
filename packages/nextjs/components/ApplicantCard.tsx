import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { Applicant } from "~~/pages/pool/applicants";

export const ApplicantCard = (props: { applicant: Applicant; onClickAllocate: () => void }) => {
  const { applicant, onClickAllocate } = props;
  const { address } = useAccount();
  const displayAddress = address?.slice(0, 5) + "..." + address?.slice(-4);

  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body p-5">
        <h2 className="card-title m-0">{displayAddress}</h2>
        <div>
          <p className="m-0">Bid (ETH): {formatEther(applicant.bid)}</p>
          <p className="m-0">{applicant.description}</p>
        </div>
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={onClickAllocate}>
            Allocate
          </button>
        </div>
      </div>
    </div>
  );
};
