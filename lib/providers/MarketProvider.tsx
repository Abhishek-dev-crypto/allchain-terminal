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

import type { Coin } from "@/lib/types/coin";
import type { MarketContextType } from "@/lib/types/market";

import { buildMarketEngine } from "@/lib/intel/marketEngine";
import { buildMarketIntelligence } from "@/lib/intel/buildMarketIntelligence";
import { buildFreeNarrativeEngine } from "@/lib/intel/freeNarrativeEngine";

import { getMarketSnapshot } from "@/lib/intel/core/marketSnapshotStore";
import { emitMarketEvent } from "@/lib/events/marketEvents";

/* ----------------------------- */
/* Context                       */
/* ----------------------------- */

const MarketContext = createContext<MarketContextType | null>(null);

type MarketProviderProps = {
  children: ReactNode;
};

/* ----------------------------- */
/* Provider                      */
/* ----------------------------- */

export function MarketProvider({ children }: MarketProviderProps) {
 const [snapshot, setSnapshot] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [regimeHistory, setRegimeHistory] = useState<
    { regime: string; timestamp: number }[]
  >([]);

  /* ----------------------------- */
  /* SINGLE SNAPSHOT LOOP         */
  /* ----------------------------- */

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const data = await getMarketSnapshot();

        if (!mounted) return;

        setSnapshot(data);
        setLastUpdated(data.timestamp);

        emitMarketEvent("MARKET_REFRESHED");
      } catch (err) {
        console.error("Snapshot error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    const interval = setInterval(load, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  /* ----------------------------- */
  /* DERIVED DATA                 */
  /* ----------------------------- */

  const coins: Coin[] = snapshot?.coins || [];

  const engine = useMemo(() => {
    return buildMarketEngine(coins);
  }, [coins]);

  const intelligence = useMemo(() => {
    return buildMarketIntelligence(engine);
  }, [engine]);

  const narratives = useMemo(() => {
  if (!snapshot) return [];
  return buildFreeNarrativeEngine(engine);
}, [snapshot]);

  const previousRegime = useRef(engine.regime);

  useEffect(() => {
    if (previousRegime.current !== engine.regime) {
      emitMarketEvent("REGIME_CHANGED");

      setRegimeHistory((prev) =>
        [
          {
            regime: engine.regime,
            timestamp: Date.now(),
          },
          ...prev,
        ].slice(0, 25)
      );

      previousRegime.current = engine.regime;
    }
  }, [engine.regime]);

  /* ----------------------------- */
  /* CONTEXT VALUE                */
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
    streamStatus: "CONNECTED",
  };

  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
}

/* ----------------------------- */
/* Hook                          */
/* ----------------------------- */

export function useMarket() {
  const context = useContext(MarketContext);

  if (!context) {
    throw new Error("useMarket must be used within MarketProvider");
  }

  return context;
}