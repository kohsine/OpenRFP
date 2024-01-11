import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Allo } from "@allo-team/allo-v2-sdk/";
import { TransactionData, ZERO_ADDRESS } from "@allo-team/allo-v2-sdk/dist/Common/types";
import { sendTransaction, waitForTransaction } from "@wagmi/core";
import type { NextPage } from "next";
import { encodeAbiParameters, parseAbiParameters, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { processLogs } from "~~/utils/events";
import { uploadJson } from "~~/utils/ipfs";

const ApplyPool: NextPage = () => {
  const router = useRouter();
  const { address } = useAccount();
  const alloRfpSimpleInfo = useDeployedContractInfo("allo_rfp_simple");
  const [poolId, setPoolId] = useState<string>("");
  const [bid, setBid] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (!(router.query.p instanceof Array)) setPoolId(router.query.p ?? "");
  }, [router.query.p]);

  async function registerRecipient() {
    const ipfsHash = await uploadJson({ description });
    if (!poolId) throw new Error("pool ID is undefined");
    if (!address) throw new Error("address is undefined");
    if (!alloRfpSimpleInfo.data) throw new Error("contract is undefined");
    if (!bid) throw new Error("bid undefined");
    const allo = new Allo({ chain: 421614, rpc: "https://sepolia-rollup.arbitrum.io/rpc" });
    const strategyData = encodeAbiParameters(parseAbiParameters("address, address, uint256, (uint256, string)"), [
      ZERO_ADDRESS,
      address,
      parseEther(bid),
      [1n, ipfsHash],
    ]);
    const txData: TransactionData = allo.registerRecipient(parseInt(poolId), strategyData);

    const sendResult = await sendTransaction({
      data: txData.data,
      to: txData.to,
      value: BigInt(txData.value),
    });
    const receipt = await waitForTransaction({ hash: sendResult.hash, chainId: 421614 });
    console.log("receipt", receipt);

    const topics = processLogs(alloRfpSimpleInfo.data.abi, receipt.logs);
    console.log(topics);
  }

  return (
    <div className="flex flex-col flex-grow items-center bg-base-300 w-full px-8 py-24">
      <div className="px-5 mb-14">
        <h1 className="text-center">
          <span className="block text-2xl font-bold">Apply to a pool</span>
        </h1>
        <p className="text-center text-lg">Write why you think you would be the best recipient</p>
      </div>
      <div className="flex flex-col items-center gap-4 w-full lg:w-1/2 xl:w-2/3 2xl:w-5/12">
        <input
          type="text"
          placeholder="Pool ID"
          value={poolId}
          className="input w-full"
          onChange={e => setPoolId(e.target.value)}
        />
        <input type="text" placeholder="Bid" className="input w-full" onChange={e => setBid(e.target.value)} />
        <textarea
          placeholder="Description"
          className="textarea w-full h-[40vh]"
          onChange={e => setDescription(e.target.value)}
        ></textarea>
        <button className="btn btn-md btn-primary w-full" onClick={() => registerRecipient()}>
          Apply
        </button>
      </div>
    </div>
  );
};

export default ApplyPool;
