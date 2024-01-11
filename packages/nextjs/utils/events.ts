import { Abi, Log, decodeEventLog } from "viem";

export function processLogs(abi: Abi, logs: Log<bigint, number, false>[]) {
  return logs.map(log => {
    try {
      const topics = decodeEventLog({ abi, data: log.data, topics: log.topics });
      return topics;
    } catch (e) {
      return undefined;
    }
  });
}
