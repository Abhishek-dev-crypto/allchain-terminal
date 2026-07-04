"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useGenie } from "@/app/contexts/GenieRuntimeContext";

export function useGenieRuntime() {
  const pathname = usePathname();
  const { state, setStage, nextStep } = useGenie();

  // PAGE → STAGE
  useEffect(() => {
    if (pathname === "/") setStage("landing");
    if (pathname === "/trade") setStage("trade");
    if (pathname === "/intel") setStage("intel");
  }, [pathname]);

  // LANDING SPOTLIGHT ONLY
  useEffect(() => {
  if (state.stage !== "landing") return;

  const stepMap = [
    "header",
    "ai-preview",
    "market-block",
    "why-traders-fail",
    "signin-button",
  ];

  const target = stepMap[state.step];
  if (!target) return;
}, [state.stage, state.step]);
}