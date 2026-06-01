import type { Coin } from "@/lib/types/coin";


export type MarketStreamResponse = {
  coins: Coin[];
  timestamp: number;
  status: "CONNECTED" | "DISCONNECTED";
};

export async function fetchMarketStream(): Promise<MarketStreamResponse> {
  try {
    const response = await fetch("/api/intel/heatmap");

    if (!response.ok) {
      throw new Error("Failed market stream fetch");
    }

    const coins = await response.json();

    return {
      coins,
      timestamp: Date.now(),
      status: "CONNECTED",
    };
  } catch (error) {
    console.error("Market stream error:", error);

    return {
      coins: [],
      timestamp: Date.now(),
      status: "DISCONNECTED",
    };
  }
}