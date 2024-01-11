import React, { useContext } from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { PoolCard } from "~~/components/PoolCard";
import { PoolContext } from "~~/context/PoolContext";

const Home: NextPage = () => {
  const { pools, loading, refetch } = useContext(PoolContext);

  const poolCards: any[] = [];
  pools.forEach(pool => {
    poolCards.push(<PoolCard key={pool.id} pool={pool}></PoolCard>);
  });

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10 gap-5">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">Open RFP</span>
          </h1>
          <p className="text-center text-lg">Get started by applying to pools or create your own</p>
        </div>
        <button className="btn btn-secondary" onClick={() => refetch()}>
          {loading ? <span className="loading loading-spinner"></span> : "Refresh"}
        </button>
        <div className="flex flex-col w-full lg:w-1/2 xl:w-2/3 2xl:w-5/12 gap-8 px-8">{poolCards}</div>
      </div>
    </>
  );
};

export default Home;
