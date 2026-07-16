"use client";

import { useEffect } from "react";
import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * =========================
 * Types
 * =========================
 */

const GENIE_STORAGE_KEY = "genie_state_v1";
const GENIE_SEEN_KEY = "genie_seen_v1";
const GENIE_STATUS_KEY = "genie_status_v1";


export type GenieMood =
  | "idle"
  | "listening"
  | "speaking"
  | "guiding"
  | "alert"
  | "excited";

export type GenieStage = "landing" | "trade" | "intel" | "idle";

export type GenieState = {
  stage: GenieStage;
  step: number;
  intent: "trade" | "learn" | null;
  activeTarget: string | null;
  currentSection: string | null;
  tourActive: boolean;
  mood: GenieMood;

   minimized: boolean; // NEW
};

export type GenieContextType = {
  state: GenieState;

  isTourRunning: boolean;
  isTourIdle: boolean;
  hydrated: boolean;

  setStage: (s: GenieStage) => void;
  setIntent: (i: "trade" | "learn") => void;

  startTour: (stage?: GenieStage) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;

  currentSection: string | null;
  setCurrentSection: (section: string | null) => void;

  setActiveTarget: (target: string | null) => void;

  setMinimized: (value: boolean) => void;   // <-- ADD THIS
};

/**
 * =========================
 * Tour Map (Single Source)
 * =========================
 */

const TOUR_MAP: Record<GenieStage, string[]> = {
  landing: [
    "hero-section",
  "ai-preview",
  "why-traders-fail",
  "market-block",
  "final-cta",
  ],
  trade: [],
  intel: [],
  idle: [],
};

/**
 * =========================
 * Initial State
 * =========================
 */

const initialState: GenieState = {
  stage: "idle",
  step: 0,
  intent: null,
  activeTarget: null,
  currentSection: null,
  tourActive: false,
  mood: "idle",
  minimized: false,
};

/**
 * =========================
 * Context
 * =========================
 */

const GenieContext = createContext<GenieContextType | null>(null);

/**
 * =========================
 * Provider
 * =========================
 */

export function GenieRuntimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<GenieState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  const isTourRunning = state.tourActive && !!state.activeTarget;
const isTourIdle = !state.tourActive || !state.activeTarget;

useEffect(() => {
  const blocked = isGenieBlocked();

  if (blocked) {
    localStorage.removeItem(GENIE_STORAGE_KEY);
    setState(initialState);
    setHydrated(true);
    return;
  }

  const saved = loadState();

  if (saved?.tourActive && !isGenieBlocked()) {
  setState(saved);
} else if (hasSeenGenie()) {
  setState({
    ...initialState,
    minimized: true,
  });
} else {
  setState(initialState);
}

  setHydrated(true);
}, []);

useEffect(() => {
  if (typeof window === "undefined") return;

  if (hasSeenGenie()) return;
  if (isGenieBlocked()) return;

  saveState(state);
}, [state]);

  /**
   * Set Stage
   */
  const setStage = (stage: GenieStage) => {
    setState((prev) => ({
      ...prev,
      stage,
      step: 0,
    }));
  };

  /**
   * Set Intent
   */
  const setIntent = (intent: "trade" | "learn") => {
    setState((prev) => ({
      ...prev,
      intent,
    }));
  };

  /**
   * Start Tour
   */
const startTour = (stage: GenieStage = "landing") => {
  const steps = TOUR_MAP[stage] ?? [];

  // 🔥 ALWAYS ALLOW MANUAL RESTART
  localStorage.setItem(GENIE_STATUS_KEY, "active");

  setState({
  ...initialState,
  minimized: true,
  stage,
  step: 0,
  intent: null,
  tourActive: true,
  activeTarget: steps[0] ?? null,
  mood: "idle",
});
};

  const saveState = (state: GenieState) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(GENIE_STORAGE_KEY, JSON.stringify(state));
};

const loadState = (): GenieState | null => {
  if (typeof window === "undefined") return null;

  const status = localStorage.getItem(GENIE_STATUS_KEY);

  if (status === "completed") {
    return null; // never auto-open again
  }

  try {
    const raw = localStorage.getItem(GENIE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    const stage: GenieStage =
      parsed.stage && parsed.stage in TOUR_MAP
        ? parsed.stage
        : "landing";

    const steps = TOUR_MAP[stage] ?? [];

    const safeStep = typeof parsed.step === "number" ? parsed.step : 0;

    return {
      ...initialState,
      ...parsed,
      stage,
      step: safeStep,
      activeTarget: steps[safeStep] ?? null,
      tourActive: Boolean(steps[safeStep]),
    };
  } catch {
    return null;
  }
};

const hasSeenGenie = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GENIE_SEEN_KEY) === "true";
};

const isGenieBlocked = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GENIE_STATUS_KEY) === "completed";
};
 
  /**
   * Next Step (core engine)
   */
 const nextStep = () => {
  setState((prev) => {
    const steps = TOUR_MAP[prev.stage] ?? [];

    const nextStepIndex = prev.step + 1;
    const nextTarget = steps[nextStepIndex] ?? null;

    const isLastStep = prev.step >= steps.length - 1;
    const tourCompleted = isLastStep;

    if (tourCompleted && typeof window !== "undefined") {
    localStorage.setItem(GENIE_STATUS_KEY, "completed");
    localStorage.setItem(GENIE_SEEN_KEY, "true");
  }

    return {
      ...prev,
      step: nextStepIndex,
      activeTarget: nextTarget,
      tourActive: !tourCompleted,
      
    };
  });
};

 const previousStep = () => {
  setState((prev) => {
    const steps = TOUR_MAP[prev.stage] ?? [];

    const previousIndex = Math.max(prev.step - 1, 0);
    const previousTarget = steps[previousIndex] ?? null;

    return {
      ...prev,
      step: previousIndex,
      activeTarget: previousTarget,
      tourActive: previousTarget !== null,
    };
  });
};

   useEffect(() => {
  const handler = () => {
    nextStep();
  };

  window.addEventListener("genie:next", handler);

  return () => {
    window.removeEventListener("genie:next", handler);
  };
}, [nextStep]);

  /**
   * Reset everything
   */
 const reset = () => {
  setState(initialState);

  if (typeof window !== "undefined") {
    localStorage.setItem(GENIE_SEEN_KEY, "true");
    localStorage.removeItem(GENIE_STORAGE_KEY);
  }
};

 useEffect(() => {
  // auto-start disabled
}, []);

  /**
   * Direct override (used by overlay / future AI layer)
   */
  const setActiveTarget = (target: string | null) => {
    setState((prev) => ({
      ...prev,
      activeTarget: target,
    }));
  };

  const setCurrentSection = (section: string | null) => {
  setState((prev) => ({
    ...prev,
    currentSection: section,
  }));
};

const setMinimized = (value: boolean) => {
  setState(prev => ({
    ...prev,
    minimized: value,
  }));
};

  /**
   * Memoized context value (prevents rerenders)
   */
 const value = useMemo<GenieContextType>(
  () => ({
    state,
    isTourRunning,
    isTourIdle,

    currentSection: state.currentSection,

    setStage,
    setIntent,
    startTour,
    nextStep,
    previousStep,
    reset,
    setActiveTarget,
    
    setCurrentSection,
    hydrated, // 👈
    setMinimized,
  }),
  [state, hydrated]
);

  return (
    <GenieContext.Provider value={value}>
      {children}
    </GenieContext.Provider>
  );
}

/**
 * =========================
 * Hook
 * =========================
 */

export function useGenie() {
  const ctx = useContext(GenieContext);

  if (!ctx) {
    throw new Error("useGenie must be used inside GenieRuntimeProvider");
  }

  return ctx;
}