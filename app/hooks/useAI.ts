"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AIOutput } from "@/lib/ai/AIEngine";
import type { AIUIOutput } from "@/lib/ai/formatAIForUI";

/* ================= API RESPONSE ================= */

type AIEngineAPIResponse = {
  success: boolean;
  symbol: string;
  ai: AIOutput;
  ui: AIUIOutput;
  meta: {
    timestamp: number;
    regime: string;
    confidence: number;
    action: string;
  };
  error?: string;
};

/* ================= PHASE ================= */

type Phase = "IDLE" | "SCANNING" | "PROCESSING" | "READY" | "FAILED";

/* ================= HOOK ================= */

export function useAI(symbol: string) {
  const [ai, setAI] = useState<AIOutput | null>(null);
  const [ui, setUI] = useState<AIUIOutput | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("IDLE");

  const abortRef = useRef<AbortController | null>(null);

  const runAI = useCallback(async () => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      /* ================= PHASE 1 ================= */
      setPhase("SCANNING");
      await new Promise((r) => setTimeout(r, 300));

      /* ================= PHASE 2 ================= */
      setPhase("PROCESSING");

     

      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;


      const res = await fetch("/api/ai/engine", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });

      if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
      }

      const json: AIEngineAPIResponse = await res.json();

      if (!json.success) {
        setError(json.error || "AI engine failed");
       
        setPhase("IDLE");
        return;
      }

      /* ================= STORE RESULTS ================= */
      setAI(json.ai);
      setUI(json.ui);

      /* ================= PHASE 3 ================= */
      setPhase("READY");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
    }
      setError(err instanceof Error ? err.message : "Network error");
    
      setPhase("IDLE");
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
  return () => {
    abortRef.current?.abort();
  };
}, []);

  /* ================= AUTO RUN ================= */
  useEffect(() => {
    if (!symbol) return;
    runAI();
  }, [symbol, runAI]);

  return {
    ai,
    ui,
    loading,
    error,
    phase,
    runAI,
  };
}