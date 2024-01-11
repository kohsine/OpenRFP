import React, { createContext } from "react";
import { usePools } from "~~/hooks/allo/usePools";

// Create two context:
// UserContext: to query the context state
// UserDispatchContext: to mutate the context state
const PoolContext = createContext<{ pools: any[]; managedPools: any[]; loading: boolean; refetch: () => void }>({
  pools: [],
  managedPools: [],
  loading: false,
  refetch: () => {},
});

// A "provider" is used to encapsulate only the
// components that needs the state in this context
function PoolProvider({ children }: { children: any }) {
  const { pools, managedPools, loading, refetch } = usePools();
  return <PoolContext.Provider value={{ pools, managedPools, loading, refetch }}>{children}</PoolContext.Provider>;
}

export { PoolProvider, PoolContext };
