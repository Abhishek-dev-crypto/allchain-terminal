import type { Coin } from "@/lib/types/coin";

import type { useMarketSnapshot } from "@/lib/intel/useMarketSnapshot";

import type { buildMarketEngine } from "@/lib/intel/marketEngine";

import type { buildMarketIntelligence } from "@/lib/intel/buildMarketIntelligence";

import type { buildFreeNarrativeEngine } from "@/lib/intel/freeNarrativeEngine";

export type MarketRegime =
  | "RISK_ON"
  | "RISK_OFF"
  | "NEUTRAL"
  | "VOLATILE";

export type StreamStatus =
  | "CONNECTED"
  | "SYNCING"
  | "DEGRADED"
  | "DISCONNECTED";

export type MarketContextType = {
  coins: Coin[];

 snapshot: ReturnType<typeof useMarketSnapshot>;

    engine: ReturnType<typeof buildMarketEngine>;

    intelligence: ReturnType<typeof buildMarketIntelligence>;

    narratives: ReturnType<typeof buildFreeNarrativeEngine>;

  loading: boolean;

lastUpdated: number;

streamStatus: StreamStatus;

regimeHistory: {
  regime: string;
  timestamp: number;
}[];

};