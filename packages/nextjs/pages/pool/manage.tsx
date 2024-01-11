import { useContext } from "react";
import { PoolCard } from "~~/components/PoolCard";
import { PoolContext } from "~~/context/PoolContext";

const ManagePool = () => {
  const { managedPools } = useContext(PoolContext);

  return (
    <div className="flex flex-col flex-grow bg-base-300 w-full px-8 py-24 items-center">
      <div className="px-5 mb-14">
        <h1 className="text-center">
          <span className="block text-2xl font-bold">Manage pools</span>
        </h1>
        <p className="text-center text-lg">A list of all the pools you manage</p>
      </div>
      <div className="flex flex-col justify-center items-center gap-8 w-full lg:w-2/3 xl:w-1/3">
        {managedPools.map(pool => {
          return <PoolCard key={pool.id} pool={pool}></PoolCard>;
        })}
      </div>
    </div>
  );
};

export default ManagePool;
