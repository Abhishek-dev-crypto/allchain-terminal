"use client";

import { createContext, useContext, useState } from "react";
import { IntelligenceLens } from "./lenses";

type TerminalState = {
  activeLens: IntelligenceLens;
  setActiveLens: (lens: IntelligenceLens) => void;
};

const TerminalContext = createContext<TerminalState | null>(null);

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [activeLens, setActiveLens] =
    useState<IntelligenceLens>("overview");

  return (
    <TerminalContext.Provider value={{ activeLens, setActiveLens }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const ctx = useContext(TerminalContext);

  if (!ctx) {
    throw new Error("useTerminal must be used inside provider");
  }

  return ctx;
}
