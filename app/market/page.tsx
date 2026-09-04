
"use client";

import { useEffect, useState } from "react";

/* ================================================== */
/* PROVIDERS */
/* ================================================== */

import {
  MarketProvider,
  useMarket,
} from "@/lib/providers/MarketProvider";

import {
  TerminalProvider,
  useTerminal,
} from "@/lib/terminal/TerminalContext";

/* ================================================== */
/* UI */
/* ================================================== */

import LeftIntelligencePanel from "../components/terminal/LeftIntelligencePanel";
import PremiumRail from "../components/terminal/PremiumRail";

/* ================================================== */
/* WORKSPACES */
/* ================================================== */

import OverviewWorkspace from "../components/terminal/workspaces/OverviewWorkspace";
import NarrativeWorkspace from "../components/terminal/workspaces/NarrativeWorkspace";
import SentimentWorkspace from "../components/terminal/workspaces/SentimentWorkspace";
import MomentumWorkspace from "../components/terminal/workspaces/MomentumWorkspace";
import FlowWorkspace from "../components/terminal/workspaces/FlowWorkspace";
import RotationWorkspace from "../components/terminal/workspaces/RotationWorkspace";
import HeatmapWorkspace from "../components/terminal/workspaces/HeatmapWorkspace";
import RegimeWorkspace from "../components/terminal/workspaces/RegimeWorkspace";
import WhaleWorkspace from "../components/terminal/workspaces/WhaleWorkspace";
import AlertsWorkspace from "../components/terminal/workspaces/AlertsWorkspace";

/* ================================================== */
/* SHARED */
/* ================================================== */

import TerminalGuide from "../components/terminal/shared/TerminalGuide";
import AuthGuard from "../components/auth/AuthGuard";

/* ================================================== */
/* PREMIUM */
/* ================================================== */

import AlphaSignals from "../components/terminal/premium/AlphaSignals";
import PredictiveAI from "../components/terminal/premium/PredictiveAI";
import SmartMoney from "../components/terminal/premium/SmartMoney";
import LiquidityHeat from "../components/terminal/premium/LiquidityHeat";
import WhaleIntent from "../components/terminal/premium/WhaleIntent";
import RegimeForecast from "../components/terminal/premium/RegimeForecast";
import MarketRegime from "../components/terminal/premium/MarketRegime";
import EdgeOpportunities from "../components/terminal/premium/EdgeOpportunities";

import { usePremiumEntitlement } from "@/lib/premium/usePremiumEntitlement";

import { trackEvent } from "@/lib/analytics";

/* ================================================== */
/* MAIN TERMINAL */
/* ================================================== */

function MarketTerminal() {
  /* ================================================== */
  /* MARKET STATE */
  /* ================================================== */

  const {
    streamStatus,
    lastUpdated,
  } = useMarket();

  /* ================================================== */
  /* TERMINAL STATE */
  /* ================================================== */

  const {
    activeLens,
  } = useTerminal();

  /* ================================================== */
  /* PREMIUM STATE */
  /* ================================================== */

  const {
    isPremium,
    premiumLoading,
  } = usePremiumEntitlement();

  /* ================================================== */
  /* UI STATE */
  /* ================================================== */

  const [mounted, setMounted] =
    useState(false);

  const [guideOpen, setGuideOpen] =
    useState(false);

  const [lensOverlayOpen, setLensOverlayOpen] =
    useState(false);

  /* ================================================== */
  /* MOUNT */
  /* ================================================== */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ================================================== */
  /* ANALYTICS */
  /* ================================================== */

  useEffect(() => {
  trackEvent("market_loaded");
}, []);

  return (
    <div className="relative min-h-screen bg-[#0B1220] text-white">

      {/* ================================================== */}
      {/* COMPACT TOP BAR */}
      {/* ================================================== */}

      <div className="flex h-9 items-center justify-between border-b border-white/10 px-3">

        {/* ================================================== */}
        {/* LEFT — TERMINAL TITLE */}
        {/* ================================================== */}

        <div className="flex min-w-0 items-center gap-2.5">

          <h1 className="shrink-0 text-sm font-semibold text-white">
            Market Terminal
          </h1>

          <div className="h-1 w-1 shrink-0 rounded-full bg-white/20" />

          <div className="truncate text-[8px] uppercase tracking-[0.2em] text-cyan-300">
            Live Intelligence
          </div>

        </div>

        {/* ================================================== */}
        {/* RIGHT — STATUS */}
        {/* ================================================== */}

        <div className="flex shrink-0 items-center gap-3">

          {/* ================================================== */}
          {/* CONNECTION STATUS */}
          {/* ================================================== */}

          <div className="flex items-center gap-1.5">

            <div
              className={`
                h-1.5
                w-1.5
                rounded-full
                ${
                  streamStatus === "CONNECTED"
                    ? "bg-emerald-400"
                    : streamStatus === "SYNCING"
                    ? "bg-yellow-400"
                    : streamStatus === "DEGRADED"
                    ? "bg-orange-400"
                    : "bg-red-400"
                }
              `}
            />

            <div className="text-[9px] font-medium text-white/55">
              {streamStatus}
            </div>

          </div>

          {/* ================================================== */}
          {/* LAST UPDATED */}
          {/* ================================================== */}

          <div className="hidden text-[9px] text-white/25 sm:block">
            {mounted
              ? new Date(
                  lastUpdated
                ).toLocaleTimeString()
              : "--:--:--"}
          </div>

          {/* ================================================== */}
          {/* GUIDE */}
          {/* ================================================== */}

          <button
            type="button"
            onClick={() =>
              setGuideOpen(true)
            }
            title="Terminal Guide"
            aria-label="Terminal Guide"
            className="
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-md
              border
              border-cyan-500/20
              bg-cyan-500/5
              text-[10px]
              text-cyan-300
              transition-all
              hover:bg-cyan-500/10
            "
          >
            ⓘ
          </button>

        </div>

      </div>

      {/* ================================================== */}
      {/* TERMINAL GUIDE */}
      {/* ================================================== */}

      {guideOpen && (
        <TerminalGuide
          onClose={() =>
            setGuideOpen(false)
          }
        />
      )}

      {/* ================================================== */}
      {/* MOBILE INTELLIGENCE STRIP */}
      {/* ================================================== */}

      <div className="absolute left-0 top-9 z-40 xl:hidden">

        <button
          type="button"
          onClick={() =>
            setLensOverlayOpen(true)
          }
          aria-label="Open Intelligence Lenses"
          className="
            flex
            flex-col
            border-r
            border-white/10
            bg-[#0B1220]
            shadow-xl
          "
        >

          {[
            "O",
            "N",
            "S",
            "M",
            "F",
            "R",
            "H",
            "W",
            "A",
          ].map((letter) => (
            <span
              key={letter}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                border-b
                border-white/5
                text-[10px]
                text-white/60
              "
            >
              {letter}
            </span>
          ))}

        </button>

      </div>

      {/* ================================================== */}
      {/* MAIN GRID */}
      {/* ================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-2
          p-2
          xl:grid-cols-12
        "
      >

        {/* ================================================== */}
        {/* LEFT — INTELLIGENCE NAVIGATION */}
        {/* ================================================== */}

        <div className="hidden xl:block xl:col-span-2">

          <LeftIntelligencePanel />

        </div>

        {/* ================================================== */}
        {/* CENTER — MAIN WORKSPACE */}
        {/* ================================================== */}

        <div
          className="
            min-w-0
            space-y-2
            pl-11
            xl:col-span-8
            xl:pl-0
          "
        >

          {/* ================================================== */}
          {/* CORE INTELLIGENCE LENSES */}
          {/* ================================================== */}

          {activeLens === "overview" && (
            <OverviewWorkspace />
          )}

          {activeLens === "narrative" && (
            <NarrativeWorkspace />
          )}

          {activeLens === "sentiment" && (
            <SentimentWorkspace />
          )}

          {activeLens === "momentum" && (
            <MomentumWorkspace />
          )}

          {activeLens === "flows" && (
            <FlowWorkspace />
          )}

          {activeLens === "rotation" && (
            <RotationWorkspace />
          )}

          {activeLens === "heatmap" && (
            <HeatmapWorkspace />
          )}

          {activeLens === "regime" && (
            <RegimeWorkspace />
          )}

          {activeLens === "whales" && (
            <WhaleWorkspace />
          )}

          {activeLens === "alerts" && (
            <AlertsWorkspace />
          )}

          {/* ================================================== */}
          {/* PREMIUM INTELLIGENCE */}
          {/* ================================================== */}

          {activeLens === "alpha_signals" && (
            <AlphaSignals />
          )}

          {activeLens === "predictive_ai" && (
            <PredictiveAI />
          )}

          {activeLens === "smart_money" && (
            <SmartMoney />
          )}

          {activeLens === "liquidity_heat" && (
            <LiquidityHeat />
          )}

          {activeLens === "whale_intent" && (
            <WhaleIntent />
          )}

          {activeLens === "market_regime" && (
            <MarketRegime />
          )}

          {activeLens === "regime_forecast" && (
            <RegimeForecast />
          )}

          {activeLens === "edge_opportunities" && (
            <EdgeOpportunities />
          )}

        </div>

        {/* ================================================== */}
        {/* RIGHT — AI COMMAND LAYER */}
        {/* ================================================== */}

        <div className="hidden xl:block xl:col-span-2">

          <div
            className="
              ml-auto
              h-full
              max-w-[260px]
              overflow-y-auto
            "
          >

            <PremiumRail
              isPremium={isPremium}
              premiumLoading={
                premiumLoading
              }
            />

          </div>

        </div>

      </div>

      {/* ================================================== */}
      {/* MOBILE LENS OVERLAY */}
      {/* ================================================== */}

      {lensOverlayOpen && (
        <div className="absolute inset-0 z-50 bg-black/70 xl:hidden">

          {/* ================================================== */}
          {/* MOBILE LEFT PANEL */}
          {/* ================================================== */}

          <div
            className="
              absolute
              bottom-0
              left-0
              top-9
              w-[280px]
              overflow-y-auto
              border-r
              border-white/10
              bg-[#0B1220]
            "
          >

            <LeftIntelligencePanel
              onLensSelect={() =>
                setLensOverlayOpen(false)
              }
            />

          </div>

          {/* ================================================== */}
          {/* MOBILE BACKDROP */}
          {/* ================================================== */}

          <div
            className="
              absolute
              bottom-0
              left-[280px]
              right-0
              top-0
            "
            onClick={() =>
              setLensOverlayOpen(false)
            }
          />

        </div>
      )}

    </div>
  );
}

/* ================================================== */
/* PAGE WRAPPER */
/* ================================================== */

export default function MarketPage() {
  return (
    <AuthGuard>

      <MarketProvider>

        <TerminalProvider>

          <MarketTerminal />

        </TerminalProvider>

      </MarketProvider>

    </AuthGuard>
  );
}
