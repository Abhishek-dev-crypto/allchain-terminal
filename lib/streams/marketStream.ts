import type { Coin } from "@/lib/types/coin";
import { getMarketSnapshot } from "@/lib/intel/core/marketSnapshotStore";

export type MarketStreamResponse = {
  coins: Coin[];
  timestamp: number;
  status: "CONNECTED" | "DISCONNECTED";
};

export async function fetchMarketStream(): Promise<MarketStreamResponse> {
  try {
    const data = await getMarketSnapshot();

    return {
      coins: data.coins,
      timestamp: data.timestamp,
      status: data.coins.length ? "CONNECTED" : "DISCONNECTED",
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