import type { AIOutput } from "@/lib/ai/AIEngine";

/**
 * ONLY ONE TRUTH NOW
 */
export type AIEngineInput = {
  symbol: string;
};

export type AIEngineResponse = {
  success: true;
  ai: AIOutput;
};

export type AIEngineError = {
  success: false;
  error: string;
};