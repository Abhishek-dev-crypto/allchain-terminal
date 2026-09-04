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

/* =========================================================
   CONTEXT
========================================================= */

const MarketContext =
  createContext<MarketContextType | null>(null);

type MarketProviderProps = {
  children: ReactNode;
};

/* =========================================================
   PROVIDER
========================================================= */

export function MarketProvider({
  children,
}: MarketProviderProps) {
  /* =========================================================
     STATE
  ========================================================= */

  const [snapshot, setSnapshot] =
    useState<any | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [lastUpdated, setLastUpdated] =
    useState(Date.now());

  const [regimeHistory, setRegimeHistory] =
    useState<
      {
        regime: string;
        timestamp: number;
      }[]
    >([]);

  /* -------------------------------------------------------
     ALPHA SIGNALS
  ------------------------------------------------------- */

  const [alphaSignals, setAlphaSignals] =
    useState<any | null>(null);

  /* -------------------------------------------------------
     PREDICTIVE AI
  ------------------------------------------------------- */

  const [predictiveAI, setPredictiveAI] =
    useState<any | null>(null);

  const [
    predictiveAILoading,
    setPredictiveAILoading,
  ] = useState(false);

  /* =========================================================
     REFS
  ========================================================= */

  const previousSectorRef =
    useRef<Record<string, number>>({});

  const previousRegime =
    useRef<string | null>(null);

  /* =========================================================
     SINGLE SNAPSHOT LOOP
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const data =
          await getMarketSnapshot();

        if (!mounted) {
          return;
        }

        setSnapshot(data);

        setLastUpdated(
          data.timestamp
        );

        emitMarketEvent(
          "MARKET_REFRESHED"
        );
      } catch (err) {
        console.error(
          "Snapshot error:",
          err
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    const interval =
      setInterval(
        load,
        60000
      );

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  /* =========================================================
     DERIVED MARKET DATA
  ========================================================= */

  const coins: Coin[] =
    snapshot?.coins ?? [];

  const engine = useMemo(() => {
    return buildMarketEngine(
      coins,
      previousSectorRef.current
    );
  }, [coins]);

  const intelligence = useMemo(() => {
    return buildMarketIntelligence(
      engine
    );
  }, [engine]);

  /* =========================================================
     ALPHA SIGNALS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadAlphaSignals() {
      if (!coins.length) {
        setAlphaSignals(null);
        return;
      }

      try {
        const res =
          await fetch(
            "/api/intel/alpha-signals",
            {
              cache: "no-store",
            }
          );

        if (!res.ok) {
          throw new Error(
            `Alpha Signals request failed: ${res.status}`
          );
        }

        const result =
          await res.json();

        if (!cancelled) {
          setAlphaSignals(result);
        }
      } catch (error) {
        console.error(
          "Alpha Signals error:",
          error
        );

        if (!cancelled) {
          setAlphaSignals(null);
        }
      }
    }

    loadAlphaSignals();

    return () => {
      cancelled = true;
    };
  }, [
    snapshot?.timestamp,
    coins.length,
  ]);

 /* =========================================================
   PREDICTIVE AI
========================================================= */

useEffect(() => {
  let cancelled = false;

  async function loadPredictiveAI() {
    if (
      !coins.length ||
      !alphaSignals
    ) {
      setPredictiveAI(null);
      setPredictiveAILoading(false);
      return;
    }

    try {
      setPredictiveAILoading(true);

      const res = await fetch(
        "/api/intel/predictive-ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            coins,
            engine,
            alphaSignals,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          `Predictive AI request failed: ${res.status}`
        );
      }

      const result =
        await res.json();

      if (!cancelled) {
        setPredictiveAI(result);
      }
    } catch (error) {
      console.error(
        "Predictive AI error:",
        error
      );

      if (!cancelled) {
        setPredictiveAI(null);
      }
    } finally {
      if (!cancelled) {
        setPredictiveAILoading(false);
      }
    }
  }

  loadPredictiveAI();

  return () => {
    cancelled = true;
  };
}, [
  snapshot?.timestamp,
  coins,
  engine,
  alphaSignals,
]);

  /* =========================================================
     NARRATIVES
  ========================================================= */

  const narratives =
    useMemo(() => {
      if (
        !snapshot ||
        !coins.length
      ) {
        return [];
      }

      return buildFreeNarrativeEngine(
        engine
      );
    }, [
      snapshot,
      coins.length,
      engine,
    ]);

  /* =========================================================
     REGIME HISTORY
  ========================================================= */

  useEffect(() => {
    if (
      previousRegime.current === null
    ) {
      previousRegime.current =
        engine.regime;

      return;
    }

    if (
      previousRegime.current !==
      engine.regime
    ) {
      emitMarketEvent(
        "REGIME_CHANGED"
      );

      setRegimeHistory(
        (prev) =>
          [
            {
              regime:
                engine.regime,
              timestamp:
                Date.now(),
            },
            ...prev,
          ].slice(0, 25)
      );

      previousRegime.current =
        engine.regime;
    }
  }, [
    engine.regime,
  ]);

  /* =========================================================
     SECTOR HISTORY
  ========================================================= */

  useEffect(() => {
    if (
      !engine.sectorRotation?.sectors
        ?.length
    ) {
      return;
    }

    const nextState: Record<
      string,
      number
    > = {};

    for (
      const sector of
        engine.sectorRotation.sectors
    ) {
      nextState[
        sector.name
      ] = sector.change;
    }

    previousSectorRef.current =
      nextState;
  }, [engine]);

  /* =========================================================
     CONTEXT VALUE
  ========================================================= */

  const value:
    MarketContextType = {
    coins,

    snapshot,

    engine,

    rotation:
      engine.sectorRotation,

    intelligence,

    narratives,

    alphaSignals,

    predictiveAI,

    predictiveAILoading,

    regimeHistory,

    loading,

    lastUpdated,

    streamStatus:
      "CONNECTED",
  };

  return (
    <MarketContext.Provider
      value={value}
    >
      {children}
    </MarketContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useMarket() {
  const context =
    useContext(
      MarketContext
    );

  if (!context) {
    throw new Error(
      "useMarket must be used within MarketProvider"
    );
  }

  return context;
}