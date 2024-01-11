import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Allo } from "@allo-team/allo-v2-sdk";
import { TransactionData } from "@allo-team/allo-v2-sdk/dist/Common/types";
import { sendTransaction, waitForTransaction } from "@wagmi/core";
import { encodeAbiParameters, parseEther } from "viem";

const Allocate = () => {
  const router = useRouter();
  const [poolId, setPoolId] = useState<string>("");
  const [recipientId, setRecipientId] = useState<string>("");
  const [amount, setAmount] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!(router.query.p instanceof Array)) setPoolId(router.query.p ?? "");
    if (!(router.query.r instanceof Array)) setRecipientId(router.query.r ?? "");
  }, [router.query.p, router.query.r]);

  async function allocate() {
    if (!recipientId) throw new Error("recipient address undefined");
    if (!amount) throw new Error("amount not defined");
    if (!poolId) throw new Error("pool ID undefined");
    const allo = new Allo({ chain: 421614, rpc: "https://sepolia-rollup.arbitrum.io/rpc" });

    const encodedData = encodeAbiParameters(
      [
        { name: "acceptedRecipientId", type: "address" },
        { name: "finalProposalBid", type: "uint256" },
      ],
      [recipientId, parseEther(amount)],
    );

    const txData: TransactionData = allo.allocate(parseInt(poolId), encodedData);
    const sendResult = await sendTransaction({
      data: txData.data,
      to: txData.to,
      value: BigInt(txData.value),
    });
    const receipt = await waitForTransaction({ chainId: 421614, hash: sendResult.hash });
    console.log(receipt);
  }

  return (
    <div className="flex flex-col flex-grow bg-base-300 w-full px-8 py-24 items-center ">
      <div className="px-5 mb-14">
        <h1 className="text-center">
          <span className="block text-2xl font-bold">Allocate</span>
        </h1>
        <p className="text-center text-lg">Allocate pool funds to a proposal</p>
      </div>
      <div className="flex flex-col justify-center items-center gap-4 w-full lg:w-1/2 xl:w-2/3 2xl:w-5/12">
        <input
          type="text"
          placeholder="Pool ID"
          value={poolId}
          className="input w-full"
          onChange={e => setPoolId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipientId}
          className="input w-full"
          onChange={e => setRecipientId(e.target.value)}
        />
        <input type="text" placeholder="Amount" className="input w-full" onChange={e => setAmount(e.target.value)} />
        <button className="btn btn-primary btn-md w-full" onClick={() => allocate()}>
          Allocate
        </button>
      </div>
    </div>
  );
};

export default Allocate;
