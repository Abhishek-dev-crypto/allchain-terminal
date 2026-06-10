"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  defaultGenieState,
  GenieState,
  updateGenieState,
  nextTradeStep,
  nextIntelStep,
} from "@/lib/genieEngine";

export function useGenieRuntime() {
  const pathname = usePathname();

  const [state, setState] = useState<GenieState>(defaultGenieState);

  // 🧭 1. Detect page → set stage
  useEffect(() => {
    let newStage: GenieState["stage"] = "onboarding";

    if (pathname === "/trade") newStage = "trading";
    if (pathname === "/intel") newStage = "intel";

    setState((prev) =>
      updateGenieState(prev, {
        stage: newStage,
      })
    );
  }, [pathname]);

  // 🎯 2. Set user intent (called from buttons in UI)
  const setIntent = (intent: "trade" | "learn") => {
    setState((prev) =>
      updateGenieState(prev, {
        intent,
      })
    );
  };

  // 📊 3. Trade flow progression
  const advanceTradeFlow = () => {
    setState((prev) =>
      updateGenieState(prev, {
        tradeStep: nextTradeStep(prev.tradeStep),
      })
    );
  };

  // 🧠 4. Intel flow progression
  const advanceIntelFlow = () => {
    setState((prev) =>
      updateGenieState(prev, {
        intelStep: nextIntelStep(prev.intelStep),
      })
    );
  };

  // 🔄 5. Reset (optional but useful)
  const resetGenie = () => {
    setState(defaultGenieState);
  };

  return {
    state,

    setState,
    setIntent,

    advanceTradeFlow,
    advanceIntelFlow,

    resetGenie,
  };
}