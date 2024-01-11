import { useEffect, useState } from "react";
import { Registry } from "@allo-team/allo-v2-sdk/";
import { Allo } from "@allo-team/allo-v2-sdk/";
import { CreatePoolArgs } from "@allo-team/allo-v2-sdk/dist/Allo/types";
import { TransactionData } from "@allo-team/allo-v2-sdk/dist/Common/types";
import { CreateProfileArgs } from "@allo-team/allo-v2-sdk/dist/Registry/types";
import { getWalletClient, sendTransaction, waitForTransaction } from "@wagmi/core";
import type { NextPage } from "next";
import { encodeAbiParameters, parseEther } from "viem";
import { useAccount } from "wagmi";
import { bytecode } from "~~/constants/bytecode";
import { Profile, useProfiles } from "~~/hooks/allo/useProfiles";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { processLogs } from "~~/utils/events";
import { uploadJson } from "~~/utils/ipfs";

const NATIVE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLowerCase();
const STRATEGY_NAME = "kohbaby";

const CreatePool: NextPage = () => {
  const { address } = useAccount();
  const { userProfiles, setUserProfiles } = useProfiles();
  const alloRfpSimpleInfo = useDeployedContractInfo("allo_rfp_simple");
  const alloInfo = useDeployedContractInfo("allo");
  const alloRegistry = useDeployedContractInfo("allo_registry");
  const [selectedProfile, setSelectedProfile] = useState<Profile | undefined>(undefined);
  const [strategyAddress, setStrategyAddress] = useState<string>("");
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [profileName, setProfileName] = useState<string | undefined>(undefined);
  const [createdProfile, setCreatedProfile] = useState<Profile | undefined>(undefined);
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    setStrategyAddress(localStorage.getItem("strategy") ?? "");
  }, []);

  useEffect(() => {
    if (createdProfile) {
      setUserProfiles(old => [...(old ?? []), createdProfile]);
      setSelectedProfile(createdProfile);
    }
  }, [createdProfile, setUserProfiles]);

  async function createProfile() {
    const registry = new Registry({
      chain: 421614,
      rpc: "https://sepolia-rollup.arbitrum.io/rpc",
    });
    if (address && profileName && alloRegistry.data) {
      const createProfileArgs: CreateProfileArgs = {
        nonce: Date.now(),
        metadata: { protocol: BigInt(1), pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi" },
        name: profileName,
        owner: address,
        members: [],
      };
      const txData: TransactionData = registry.createProfile(createProfileArgs);

      const result = await sendTransaction({
        to: txData.to,
        data: txData.data,
        value: BigInt(txData.value),
      });
      console.log("hash", result.hash);
      const receipt = await waitForTransaction({ chainId: 421614, hash: result.hash });
      const topics = processLogs(alloRegistry.data.abi, receipt.logs);
      console.log("topics", topics);
      setCreatedProfile({
        name: (topics[0]?.args as any).name,
        owner: (topics[0]?.args as any).owner,
        profileId: (topics[0]?.args as any).profileId,
      });
    } else {
      console.log("account is undefined");
    }
  }

  async function deployStrategy() {
    const walletClient = await getWalletClient({ chainId: 421614 });
    if (!walletClient) throw new Error("wallet client is undefined");
    if (!alloRfpSimpleInfo.data) throw new Error("alloRfpSimple info not found");
    if (!alloInfo.data) throw new Error("allo contract info not found");

    const hash = await walletClient.deployContract({
      abi: alloRfpSimpleInfo.data?.abi,
      bytecode: bytecode.allo_rfp_simple as `0x${string}`,
      args: [alloInfo.data?.address, STRATEGY_NAME], // these args do nothing
    });

    const result = await waitForTransaction({ hash: hash, chainId: 421614 });
    const strategyAddress = result.contractAddress;
    if (!strategyAddress) throw new Error("failed to deploy strategy");
    console.log("strategy address", strategyAddress);
    localStorage.setItem("strategy", strategyAddress);
    setStrategyAddress(strategyAddress);
  }

  async function createPool() {
    const ipfsHash = await uploadJson({ description });
    console.log("ipfs hash", ipfsHash);

    if (!address) throw new Error("address is undefined");
    if (!alloRfpSimpleInfo.data) throw new Error("contract info is not defined");
    if (!alloInfo.data) throw new Error("contract info is not defined");
    if (!amount) throw new Error("amount undefined");
    if (!selectedProfile?.profileId) throw new Error("profile id undefined");
    const allo = new Allo({ chain: 421614, rpc: "https://sepolia-rollup.arbitrum.io/rpc" });

    const encodedData = encodeAbiParameters(
      [
        { name: "maxBid", type: "uint256" },
        { name: "useRegistryAnchor", type: "bool" },
        { name: "metadataRequired", type: "bool" },
      ],
      [parseEther(amount), false, false],
    );

    const createPoolArgs: CreatePoolArgs = {
      profileId: selectedProfile.profileId, // sender must be a profile member
      strategy: strategyAddress, // approved strategy contract
      initStrategyData: encodedData, // unique to the strategy
      token: NATIVE,
      amount: parseEther(amount),
      metadata: {
        protocol: 1n,
        pointer: ipfsHash,
      },
      managers: [address],
    };

    const txData: TransactionData = allo.createPoolWithCustomStrategy(createPoolArgs);

    const result = await sendTransaction({
      to: txData.to,
      data: txData.data,
      value: BigInt(txData.value),
    });
    const receipt = await waitForTransaction({ hash: result.hash, chainId: 421614 });
    console.log("create pool receipt", receipt);

    localStorage.removeItem("strategy");

    const topics = processLogs(alloInfo.data.abi, receipt.logs);
    console.log("topics", topics);
  }

  return (
    <div className="bg-base-300 w-full px-8 py-24">
      <div className="px-5 mb-14">
        <h1 className="text-center">
          <span className="block text-2xl font-bold">Create a pool</span>
        </h1>
        <p className="text-center text-lg">Create a pool for whatever work you want done</p>
      </div>
      <div className="flex flex-col lg:w-1/2 sm:w-full m-auto gap-10 lg:w-1/2 xl:w-2/3 2xl:w-5/12">
        <div className="flex justify-center items-center gap-4 flex-col">
          <div className="flex flex-row w-full gap-4">
            <input
              type="text"
              placeholder="Profile name"
              className="input w-full"
              onChange={e => setProfileName(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => createProfile()}>
              Create profile
            </button>
          </div>

          <select
            className="select w-full"
            disabled={userProfiles.length === 0}
            defaultValue="default"
            value={selectedProfile?.profileId}
            onChange={e => setSelectedProfile(userProfiles?.find(profile => profile.profileId === e.target.value))}
          >
            {userProfiles.length > 0 ? (
              <option value="default" disabled>
                Choose profile
              </option>
            ) : (
              <option value="default" disabled>
                No profiles
              </option>
            )}
            {userProfiles.map(profile => {
              return (
                <option key={profile.profileId} value={profile.profileId}>
                  {profile.name}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
          <button className="btn btn-primary w-full" onClick={() => deployStrategy()} disabled={strategyAddress !== ""}>
            {strategyAddress === "" ? "Deploy strategy" : "Strategy deployed at " + strategyAddress}
          </button>
        </div>
        <div className="flex justify-center items-center gap-4 flex-col">
          <input type="text" placeholder="Amount" className="input w-full" onChange={e => setAmount(e.target.value)} />
          <textarea
            placeholder="Description"
            className="textarea w-full h-[40vh]"
            onChange={e => setDescription(e.target.value)}
          ></textarea>
          <div className="flex flex-col w-full">
            <button
              className="btn btn-primary w-full"
              onClick={() => createPool()}
              disabled={!selectedProfile || !strategyAddress}
            >
              Create pool
            </button>
            {!selectedProfile && <p className="m-0 text-sm text-red-300">* Choose or create a profile</p>}
            {!strategyAddress && <p className="m-0 text-sm text-red-300">* Deploy strategy</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePool;
