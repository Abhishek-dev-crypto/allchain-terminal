"use client";

import React, { createContext, useContext } from "react";
import { useGenieRuntime } from "@/app/hooks/useGenieRuntime";

const GenieRuntimeContext = createContext<any>(null);

export function GenieRuntimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const genie = useGenieRuntime();

  return (
    <GenieRuntimeContext.Provider value={genie}>
      {children}
    </GenieRuntimeContext.Provider>
  );
}

export function useGenie() {
  return useContext(GenieRuntimeContext);
}