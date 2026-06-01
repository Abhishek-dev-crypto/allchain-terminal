"use client";

import {
  createContext,
  useContext,
  useMemo,
    useState,
    useEffect,
    useRef,
  ReactNode,
} from "react";

import { useMarketSnapshot } from "@/lib/intel/useMarketSnapshot";

import { buildMarketEngine } from "@/lib/intel/marketEngine";

import { buildMarketIntelligence } from "@/lib/intel/buildMarketIntelligence";

import { buildFreeNarrativeEngine } from "@/lib/intel/freeNarrativeEngine";

import { fetchMarketStream } from "@/lib/streams/marketStream";

import type { Coin } from "@/lib/types/coin";

import type {
  MarketContextType,
} from "@/lib/types/market";

import {
  emitMarketEvent,
} from "@/lib/events/marketEvents";

/* ----------------------------- */
/* Types                         */
/* ----------------------------- */



type MarketProviderProps = {
  children: ReactNode;
};


/* ----------------------------- */
/* Context                       */
/* ----------------------------- */

const MarketContext = createContext<MarketContextType | null>(
  null
);

/* ----------------------------- */
/* Provider                      */
/* ----------------------------- */

export function MarketProvider({
  children,
}: MarketProviderProps) {
  /* ----------------------------- */
  /* Snapshot                      */
  /* ----------------------------- */

  const [coins, setCoins] = useState<Coin[]>([]);

const [loading, setLoading] = useState(true);

const [lastUpdated, setLastUpdated] = useState(Date.now());

const [streamStatus, setStreamStatus] =
  useState<MarketContextType["streamStatus"]>(
    "CONNECTED"
  );

  const [regimeHistory, setRegimeHistory] =
  useState<
    {
      regime: string;
      timestamp: number;
    }[]
  >([]);

  useEffect(() => {
  let mounted = true;

 async function loadMarket() {
  try {
    setStreamStatus("SYNCING");

    setLoading(true);

    const result = await fetchMarketStream();

    if (!mounted) return;

    setCoins(result.coins);

    emitMarketEvent("MARKET_REFRESHED");

    setLastUpdated(result.timestamp);

    const nextStatus =
  result.coins.length > 0
    ? "CONNECTED"
    : "DEGRADED";

setStreamStatus(nextStatus);

if (nextStatus === "DEGRADED") {
  emitMarketEvent("VOLATILITY_SPIKE");
}

  } catch (error) {
    console.error("Provider stream error:", error);

    setStreamStatus("DISCONNECTED");

    emitMarketEvent(
  "STREAM_DISCONNECTED"
);

  } finally {
    if (mounted) {
      setLoading(false);
    }
  }
}

  loadMarket();

  const interval = setInterval(() => {
    loadMarket();
  }, 60000);

  return () => {
    mounted = false;

    clearInterval(interval);
  };
}, []);

  const snapshot = useMarketSnapshot(coins);

  /* ----------------------------- */
  /* Engine                        */
  /* ----------------------------- */

  const engine = useMemo(() => {
    return buildMarketEngine(coins);
  }, [coins]);

  const previousRegime =
  useRef(engine.regime);

  /* ----------------------------- */
  /* Intelligence                  */
  /* ----------------------------- */

  const intelligence = useMemo(() => {
    return buildMarketIntelligence(engine);
  }, [engine]);

  /* ----------------------------- */
  /* Narratives                    */
  /* ----------------------------- */

  const narratives = useMemo(() => {
    return buildFreeNarrativeEngine(snapshot);
  }, [snapshot]);

  

 useEffect(() => {
  if (
    previousRegime.current !==
    engine.regime
  ) {
    emitMarketEvent(
      "REGIME_CHANGED"
    );

    setRegimeHistory((prev) => [
      {
        regime: engine.regime,
        timestamp: Date.now(),
      },
      ...prev,
    ].slice(0, 25));

    previousRegime.current =
      engine.regime;
  }
}, [engine.regime]);


  /* ----------------------------- */
  /* Context Value                 */
  /* ----------------------------- */
const value: MarketContextType = {
  coins,
  snapshot,
  engine,
  intelligence,
  narratives,
    regimeHistory,
  loading,
  lastUpdated,
  streamStatus,
};

  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
}

/* ----------------------------- */
/* Hook                           */
/* ----------------------------- */

export function useMarket() {
  const context = useContext(MarketContext);

  if (!context) {
    throw new Error(
      "useMarket must be used within MarketProvider"
    );
  }

  return context;
}