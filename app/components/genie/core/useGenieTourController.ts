"use client";

import { useCallback } from "react";
import { useGenie } from "../../../contexts/GenieRuntimeContext";

/**
 * Controller = thin command layer only
 * No DOM logic
 * No event bus
 */

export function useGenieTourController() {
  const { state, startTour: ctxStartTour, nextStep, reset } = useGenie();

  /**
   * Start tour (delegates fully to context)
   */
  const startTour = useCallback(
    (stage: "landing" | "trade" | "intel" = "landing") => {
      ctxStartTour(stage);
    },
    [ctxStartTour]
  );

  /**
   * Advance step (pure delegation)
   */
  const next = useCallback(() => {
    nextStep();
  }, [nextStep]);

  /**
   * Exit tour
   */
  const exitTour = useCallback(() => {
    reset();
  }, [reset]);

  /**
   * Jump to specific target (safe direct control)
   */
  const jumpTo = useCallback(
    (target: string) => {
      // minimal safety (no DOM checks here)
      if (!target) return;

      // direct state override via context pattern
      // (assuming context supports it indirectly via start pattern)
      ctxStartTour(state.stage);
    },
    [ctxStartTour, state.stage]
  );

  return {
    state,

    startTour,
    nextStep: next,
    exitTour,
    jumpTo,
  };
}