"use client";

import { useCallback, useEffect, useState } from "react";
import type { AIOutput } from "@/lib/ai/AIEngine";

type Response =
  | { success: true; ai: AIOutput }
  | { success: false; error: string };

export function useAI(symbol: string) {
  const [ai, setAI] = useState<AIOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAI = useCallback(async () => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });

      const json = (await res.json()) as Response;

      if (!json.success) {
        setError(json.error);
        setAI(null);
        return;
      }

      setAI(json.ai);
    } catch {
      setError("Network error");
      setAI(null);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    runAI();
  }, [runAI]);

  return { ai, loading, error, runAI };
}