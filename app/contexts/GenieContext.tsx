"use client";

import React, { createContext, useContext, useState } from "react";

type GenieState =
  | "idle"
  | "welcome"
  | "goal"
  | "experience"
  | "tour"
  | "demo"
  | "completed"
  | "minimized";

type GenieContextType = {
  state: GenieState;
  setState: (s: GenieState) => void;

  goal: string | null;
  setGoal: (g: string) => void;

  experience: string | null;
  setExperience: (e: string) => void;

  tourStep: number;
  setTourStep: (n: number) => void;
};

const GenieContext = createContext<GenieContextType | null>(null);

export function GenieProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GenieState>("idle");
  const [goal, setGoal] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);

  const [tourStep, setTourStep] = useState(0);

  return (
    <GenieContext.Provider
      value={{
        state,
        setState,
        goal,
        setGoal,
        experience,
        setExperience,
        tourStep,
        setTourStep,
      }}
    >
      {children}
    </GenieContext.Provider>
  );
}

export function useGenieContext() {
  const ctx = useContext(GenieContext);
  if (!ctx) throw new Error("useGenieContext must be used inside GenieProvider");
  return ctx;
}