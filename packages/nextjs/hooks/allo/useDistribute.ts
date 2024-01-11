import { useAllo } from "./useAllo";
import { TransactionData } from "@allo-team/allo-v2-sdk/dist/Common/types";
import { sendTransaction } from "@wagmi/core";

export const useDistribute = () => {
  const { allo } = useAllo();

  async function distribute(pool: any) {
    const poolId = pool.id;
    const recipientIds = [pool.acceptedRecipientId]; // Example recipient addresses
    const strategyData = "0x0";
    console.log(poolId, recipientIds, strategyData);

    const txData: TransactionData = allo.distribute(poolId, recipientIds, strategyData);

    await sendTransaction({
      data: txData.data,
      to: txData.to,
      value: BigInt(txData.value),
    });
  }

  return { distribute };
};
