import type { Coin } from "@/lib/types/coin";

import type { useMarketSnapshot } from "@/lib/intel/useMarketSnapshot";

import type { buildMarketEngine } from "@/lib/intel/marketEngine";

import type { buildMarketIntelligence } from "@/lib/intel/buildMarketIntelligence";

import type { buildFreeNarrativeEngine } from "@/lib/intel/freeNarrativeEngine";

import type { buildSectorRotation } from "@/lib/intel/sectorRotation";

import type { AlphaSignalsOutput } from "@/lib/intel/alphaSignals";

import type { PredictiveAIOutput } from "@/lib/intel/predictiveAI";


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

  alphaSignals: AlphaSignalsOutput | null;

  predictiveAI: PredictiveAIOutput[] | null;

  predictiveAILoading: boolean;

 snapshot: ReturnType<typeof useMarketSnapshot>;

    engine: ReturnType<typeof buildMarketEngine>;

    intelligence: ReturnType<typeof buildMarketIntelligence>;

    narratives: ReturnType<typeof buildFreeNarrativeEngine>;

    rotation: ReturnType<typeof buildSectorRotation>;

  loading: boolean;

lastUpdated: number;

streamStatus: StreamStatus;

regimeHistory: {
  regime: string;
  timestamp: number;
}[];

};

export type GlobalData = {
  data: {
    total_market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    market_cap_change_percentage_24h_usd?: number;
    market_cap_percentage: {
      btc: number;
    };
    active_cryptocurrencies: number;
    markets: number;
  };
};