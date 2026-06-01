"use client";

import { useEffect, useState } from "react";

/* PROVIDERS */
import { MarketProvider, useMarket } from "@/lib/providers/MarketProvider";
import { TerminalProvider, useTerminal } from "@/lib/terminal/TerminalContext";

/* UI */
import LeftIntelligencePanel from "../components/terminal/LeftIntelligencePanel";
import PremiumRail from "../components/terminal/PremiumRail";

/* WORKSPACES */
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

import { LENSES } from "@/lib/terminal/lenses";
import TerminalGuide from "../components/terminal/shared/TerminalGuide";

/* ---------------- STATUS ---------------- */
function TerminalStatus() {
  const { streamStatus, lastUpdated } = useMarket();
  const [mounted, setMounted] = useState(false);

 

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-4 text-xs">
      <div
        className={`h-2 w-2 rounded-full ${
          streamStatus === "CONNECTED"
            ? "bg-emerald-400"
            : streamStatus === "SYNCING"
            ? "bg-yellow-400"
            : streamStatus === "DEGRADED"
            ? "bg-orange-400"
            : "bg-red-400"
        }`}
      />

      <div className="font-medium text-white/70">{streamStatus}</div>

      <div className="text-white/30">
        {mounted ? new Date(lastUpdated).toLocaleTimeString() : "--:--:--"}
      </div>
    </div>
  );
}

/* ---------------- MAIN TERMINAL ---------------- */
function MarketTerminal() {
  const { activeLens } = useTerminal();

  const [premiumOpen, setPremiumOpen] = useState(false);

  const [guideOpen, setGuideOpen] = useState(false);

  const [lensOverlayOpen, setLensOverlayOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0B1220] text-white">

      {/* TOP BAR */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Market Terminal</h1>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">
              Live Intelligence
            </div>
          </div>

          <TerminalStatus />
        </div>

        <button
    onClick={() => setGuideOpen(true)}
    className="
      rounded-lg
      border border-cyan-500/20
      bg-cyan-500/5
      px-3 py-2
      text-xs
      text-cyan-300
      hover:bg-cyan-500/10
    "
  >
    ⓘ Guide
  </button>

      </div>

       

  {guideOpen && (
  <TerminalGuide
    onClose={() => setGuideOpen(false)}
  />
)}


      {/* MOBILE CONTROL BAR */}
      {/* MOBILE INTELLIGENCE STRIP */}
<div className="xl:hidden absolute left-0 top-[80px] z-40">

  <button
    onClick={() => setLensOverlayOpen(true)}
    className="
      flex
      flex-col
      bg-[#0B1220]
      border-r
      border-white/10
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
          w-10
          h-10
          flex
          items-center
          justify-center
          text-xs
          text-white/70
          border-b
          border-white/5
        "
      >
        {letter}
      </span>
    ))}
  </button>

</div>

      {/* GRID (DESKTOP ONLY LAYOUT LOGIC STAYS SAME) */}
      <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-12">

        {/* LEFT PANEL (desktop only) */}
        <div className="hidden xl:block xl:col-span-2">
          <LeftIntelligencePanel />
        </div>

        {/* WORKSPACE */}
        <div className="xl:col-span-7 space-y-4 pl-12 xl:pl-0">
          {activeLens === "overview" && <OverviewWorkspace />}
          {activeLens === "narrative" && <NarrativeWorkspace />}
          {activeLens === "sentiment" && <SentimentWorkspace />}
          {activeLens === "momentum" && <MomentumWorkspace />}
          {activeLens === "flows" && <FlowWorkspace />}
          {activeLens === "rotation" && <RotationWorkspace />}
          {activeLens === "heatmap" && <HeatmapWorkspace />}
          {activeLens === "regime" && <RegimeWorkspace />}
          {activeLens === "whales" && <WhaleWorkspace />}
          {activeLens === "alerts" && <AlertsWorkspace />}
        </div>

        {/* PREMIUM RAIL (desktop only) */}
        <div className="hidden xl:block xl:col-span-3">
          <PremiumRail />
        </div>
      </div>

      {/* ---------------- MOBILE LEFT DRAWER ---------------- */}
      

      {/* ---------------- MOBILE PREMIUM SHEET ---------------- */}
      
      {/* MOBILE LENS OVERLAY */}
{lensOverlayOpen && (
  <div className="absolute inset-0 z-50 bg-black/70 xl:hidden">

    <div
  className="
    absolute
    left-0
    top-[72px]
    bottom-0
    w-[300px]
    bg-[#0B1220]
    border-r
    border-white/10
    overflow-y-auto
  "
>
  <LeftIntelligencePanel
    onLensSelect={() => setLensOverlayOpen(false)}
  />
</div>

   <div
  className="absolute left-[300px] right-0 top-0 bottom-0"
  onClick={() => setLensOverlayOpen(false)}
/>

  </div>
)}

    </div>
  );
}

/* ---------------- PAGE WRAPPER ---------------- */
export default function MarketPage() {
  return (
    <MarketProvider>
      <TerminalProvider>
        <MarketTerminal />
      </TerminalProvider>
    </MarketProvider>
  );
}