
"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  ChevronDown,
  ShieldAlert,
  Waves,
} from "lucide-react";

type WhaleSignal = {
  asset: string;
  symbol: string;

  whaleActivity: "LOW" | "MODERATE" | "ELEVATED" | "HIGH";

  accumulationScore: number;
  distributionScore: number;

  exchangeFlow:
    | "INFLOW"
    | "OUTFLOW"
    | "NEUTRAL"
    | "MIXED";

  walletBehavior:
    | "ACCUMULATION"
    | "DISTRIBUTION"
    | "EXCHANGE MOVEMENT"
    | "DORMANT ACTIVATION"
    | "UNUSUAL TRANSFERS"
    | "MIXED";

  intent:
    | "ACCUMULATION"
    | "DISTRIBUTION"
    | "BULLISH"
    | "BEARISH"
    | "MIXED";

  confidence: number;

  sampleSize?: number;
  observationWindow?: string;
  activeWhaleWallets?: number;
  largeTransfers?: number;

  updatedAt?: string;
};

/* ---------------------------------------------------------
   DEVELOPMENT FALLBACK DATA
--------------------------------------------------------- */

const PREVIEW_SIGNALS: WhaleSignal[] = [
  {
    asset: "Bitcoin",
    symbol: "BTC",
    whaleActivity: "ELEVATED",
    accumulationScore: 78,
    distributionScore: 31,
    exchangeFlow: "OUTFLOW",
    walletBehavior: "ACCUMULATION",
    intent: "ACCUMULATION",
    confidence: 82,
  },
  {
    asset: "Ethereum",
    symbol: "ETH",
    whaleActivity: "MODERATE",
    accumulationScore: 64,
    distributionScore: 38,
    exchangeFlow: "OUTFLOW",
    walletBehavior: "ACCUMULATION",
    intent: "BULLISH",
    confidence: 71,
  },
  {
    asset: "Solana",
    symbol: "SOL",
    whaleActivity: "HIGH",
    accumulationScore: 34,
    distributionScore: 76,
    exchangeFlow: "INFLOW",
    walletBehavior: "DISTRIBUTION",
    intent: "DISTRIBUTION",
    confidence: 86,
  },
];

/* ---------------------------------------------------------
   ACTIVITY
--------------------------------------------------------- */

function activityClass(
  activity: WhaleSignal["whaleActivity"]
) {
  switch (activity) {
    case "HIGH":
      return "text-violet-300";

    case "ELEVATED":
      return "text-cyan-300";

    case "MODERATE":
      return "text-white/60";

    default:
      return "text-white/30";
  }
}

/* ---------------------------------------------------------
   WALLET BEHAVIOR
--------------------------------------------------------- */

function behaviorClass(
  behavior: WhaleSignal["walletBehavior"]
) {
  switch (behavior) {
    case "ACCUMULATION":
      return "text-emerald-300";

    case "DISTRIBUTION":
      return "text-red-300";

    case "DORMANT ACTIVATION":
      return "text-violet-300";

    case "EXCHANGE MOVEMENT":
      return "text-cyan-300";

    case "UNUSUAL TRANSFERS":
      return "text-amber-300";

    default:
      return "text-white/45";
  }
}

/* ---------------------------------------------------------
   INTENT BADGE
--------------------------------------------------------- */

function IntentBadge({
  intent,
}: {
  intent: WhaleSignal["intent"];
}) {
  const positive =
    intent === "ACCUMULATION" || intent === "BULLISH";

  const negative =
    intent === "DISTRIBUTION" || intent === "BEARISH";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-medium uppercase tracking-wide ${
        positive
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : negative
          ? "border-red-400/20 bg-red-400/10 text-red-300"
          : "border-white/10 bg-white/5 text-white/40"
      }`}
    >
      {positive ? (
        <ArrowUpRight size={11} />
      ) : negative ? (
        <ArrowDownRight size={11} />
      ) : null}

      {intent}
    </span>
  );
}

/* ---------------------------------------------------------
   EXCHANGE FLOW BADGE
--------------------------------------------------------- */

function FlowBadge({
  flow,
}: {
  flow: WhaleSignal["exchangeFlow"];
}) {
  const styles = {
    INFLOW:
      "border-red-400/20 bg-red-400/10 text-red-300",

    OUTFLOW:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",

    MIXED:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",

    NEUTRAL:
      "border-white/10 bg-white/5 text-white/40",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-medium uppercase tracking-wide ${styles[flow]}`}
    >
      {flow === "INFLOW" && (
        <ArrowDownRight size={11} />
      )}

      {flow === "OUTFLOW" && (
        <ArrowUpRight size={11} />
      )}

      {flow}
    </span>
  );
}

/* ---------------------------------------------------------
   ACTIVITY CELL
--------------------------------------------------------- */

function ActivityCell({
  signal,
}: {
  signal: WhaleSignal;
}) {
  const score = Math.max(
    signal.accumulationScore,
    signal.distributionScore
  );

  return (
    <div className="min-w-[110px]">
      <div
        className={`text-xs font-medium ${activityClass(
          signal.whaleActivity
        )}`}
      >
        {signal.whaleActivity}
      </div>

      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-violet-400/60"
          style={{
            width: `${Math.min(
              100,
              Math.max(0, score)
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SCORE CELL
--------------------------------------------------------- */

function ScoreCell({
  accumulation,
  distribution,
}: {
  accumulation: number;
  distribution: number;
}) {
  const total = accumulation + distribution;

  const accumulationWidth =
    total > 0
      ? (accumulation / total) * 100
      : 50;

  const distributionWidth =
    total > 0
      ? (distribution / total) * 100
      : 50;

  return (
    <div className="min-w-[150px]">
      <div className="flex items-center justify-between text-[9px]">
        <span className="text-emerald-300/70">
          Acc {accumulation}
        </span>

        <span className="text-red-300/70">
          Dist {distribution}
        </span>
      </div>

      <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="bg-emerald-400/60"
          style={{
            width: `${accumulationWidth}%`,
          }}
        />

        <div
          className="bg-red-400/60"
          style={{
            width: `${distributionWidth}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   HOW WHALE INTENT WORKS
--------------------------------------------------------- */

function HowWhaleIntentWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-white/[0.025]"
        aria-expanded={open}
      >
        <div>
          <div className="flex items-center gap-2">
            <Brain
              size={14}
              className="text-violet-300/80"
            />

            <span className="text-xs font-medium text-white/80">
              How Whale Intent Works
            </span>
          </div>

          <div className="mt-1 text-[10px] text-white/30">
            How observable blockchain activity becomes a
            behavioral signal.
          </div>
        </div>

        <ChevronDown
          size={15}
          className={`shrink-0 text-white/30 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-white/5 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                title: "Large-wallet activity",
                body:
                  "The system identifies significant wallet activity and compares transfer size and frequency against historical behavior.",
              },
              {
                title: "Exchange flows",
                body:
                  "Transfers involving identified exchange addresses are monitored to identify changes in potential exchange-side liquidity.",
              },
              {
                title: "Wallet behavior",
                body:
                  "Repeated wallet actions are analyzed over time to distinguish persistent behavior from isolated transfers.",
              },
              {
                title: "Behavioral scoring",
                body:
                  "Multiple observable signals are combined into accumulation, distribution and activity scores.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-white/5 bg-black/10 p-4"
              >
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/70">
                  {item.title}
                </div>

                <div className="mt-2 text-[10px] leading-relaxed text-white/35">
                  {item.body}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-3 rounded-lg border border-amber-400/15 bg-amber-400/[0.035] p-4">
            <ShieldAlert
              size={15}
              className="mt-0.5 shrink-0 text-amber-300/70"
            />

            <div>
              <div className="text-[10px] font-medium text-amber-200/80">
                Important distinction
              </div>

              <div className="mt-1 text-[10px] leading-relaxed text-white/40">
                Blockchain data can reveal observable wallet
                behavior, but it cannot establish a wallet
                owner's intentions with certainty. Exchange
                deposits may represent selling, custody changes,
                internal transfers or other activity.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   MAIN COMPONENT
--------------------------------------------------------- */

export default function WhaleIntent() {
  const [signals, setSignals] =
    useState<WhaleSignal[]>(PREVIEW_SIGNALS);

  const [live, setLive] = useState(false);

  useEffect(() => {
    async function loadSignals() {
      try {
        const response = await fetch(
          "/api/intelligence/whale",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          setLive(false);
          return;
        }

        const data = await response.json();

        if (Array.isArray(data.signals)) {
          setSignals(data.signals);
          setLive(true);
        }
      } catch {
        setLive(false);
      }
    }

    loadSignals();
  }, []);

  return (
    <div className="space-y-4">
      {/* -------------------------------------------------
          HEADER
      ------------------------------------------------- */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Waves
              size={15}
              className="text-violet-300"
            />

            <div className="text-[10px] uppercase tracking-[0.3em] text-violet-300/80">
              On-chain Intelligence
            </div>
          </div>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Whale Intent
          </h2>

          <p className="mt-1 max-w-2xl text-xs text-white/40">
            Large-wallet behavioral intelligence across
            major crypto assets.
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.025] px-2.5 py-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                live
                  ? "bg-emerald-400"
                  : "bg-amber-400"
              }`}
            />

            <span className="text-[9px] uppercase tracking-wider text-white/30">
              {live ? "Live" : "Development"}
            </span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------
          VALUE PROPOSITION
      ------------------------------------------------- */}

      <div className="rounded-xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.07] to-cyan-500/[0.025] p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <Activity
                size={14}
                className="text-violet-300/70"
              />

              <span className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                Large-wallet intelligence
              </span>
            </div>

            <div className="mt-2 text-base font-medium text-white/80">
              Spot meaningful changes in whale behavior.
            </div>

            <div className="mt-2 text-[11px] leading-relaxed text-white/35">
              Track large-wallet activity, exchange flows,
              accumulation, distribution and behavioral changes
              across major crypto assets.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2.5 text-center">
              <div className="text-[8px] uppercase tracking-wider text-white/25">
                Signals
              </div>

              <div className="mt-1 text-sm font-semibold text-violet-300/80">
                6
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2.5 text-center">
              <div className="text-[8px] uppercase tracking-wider text-white/25">
                Analysis
              </div>

              <div className="mt-1 text-sm font-semibold text-cyan-300/80">
                On-chain
              </div>
            </div>

            <div className="col-span-2 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2.5 text-center sm:col-span-1">
              <div className="text-[8px] uppercase tracking-wider text-white/25">
                Status
              </div>

              <div className="mt-1 text-sm font-semibold text-violet-300/80">
                Development
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------
          SCANNER
      ------------------------------------------------- */}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="border-b border-white/10 bg-white/[0.025] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity
                  size={14}
                  className="text-violet-300/70"
                />

                <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Whale Behavior Scanner
                </span>
              </div>

              <div className="mt-1 text-xs text-white/60">
                Large-wallet behavior across major assets
              </div>
            </div>

            <div className="hidden text-right sm:block">
              <div className="text-[9px] uppercase tracking-wider text-white/25">
                Data
              </div>

              <div className="mt-1 text-[10px] text-violet-300/60">
                {live
                  ? "Live Intelligence"
                  : "Development Preview"}
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="sticky left-0 z-30 w-[180px] min-w-[180px] border-r border-white/10 bg-[#0b0b0f] px-4 py-3 text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
                    Asset
                  </th>

                  <th className="px-4 py-3 text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
                    Whale Activity
                  </th>

                  <th className="px-4 py-3 text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
                    Accumulation / Distribution
                  </th>

                  <th className="px-4 py-3 text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
                    Exchange Flow
                  </th>

                  <th className="px-4 py-3 text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
                    Wallet Behavior
                  </th>

                  <th className="px-4 py-3 text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
                    Intent
                  </th>

                  <th className="px-4 py-3 text-right text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
                    Confidence
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {signals.map((signal) => (
                  <tr
                    key={signal.symbol}
                    className="group transition hover:bg-white/[0.025]"
                  >
                    <td className="sticky left-0 z-20 w-[180px] min-w-[180px] border-r border-white/10 bg-[#0b0b0f] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[9px] font-semibold text-white/70">
                          {signal.symbol.slice(0, 4)}
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-white/85">
                            {signal.asset}
                          </div>

                          <div className="mt-0.5 text-[9px] text-white/25">
                            {signal.symbol}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <ActivityCell signal={signal} />
                    </td>

                    <td className="px-4 py-4">
                      <ScoreCell
                        accumulation={
                          signal.accumulationScore
                        }
                        distribution={
                          signal.distributionScore
                        }
                      />
                    </td>

                    <td className="px-4 py-4">
                      <FlowBadge
                        flow={signal.exchangeFlow}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div
                        className={`text-[10px] font-medium ${behaviorClass(
                          signal.walletBehavior
                        )}`}
                      >
                        {signal.walletBehavior}
                      </div>

                      <div className="mt-1 text-[9px] text-white/25">
                        Observable wallet pattern
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <IntentBadge
                        intent={signal.intent}
                      />
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="text-xs font-medium text-white/65">
                        {signal.confidence}%
                      </div>

                      <div className="mt-1 text-[9px] text-white/20">
                        Evidence confidence
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SCANNER FOOTER */}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 px-4 py-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-white/25">
            <span>On-chain intelligence</span>
            <span>Large-wallet behavior</span>
            <span>Observable signals</span>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] text-violet-300/50">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                live
                  ? "bg-emerald-400"
                  : "bg-amber-400"
              }`}
            />

            {live ? "Live" : "Development"}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------
          TRACKING
      ------------------------------------------------- */}

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center gap-2">
          <Waves
            size={14}
            className="text-violet-300/70"
          />

          <div className="text-[10px] uppercase tracking-[0.22em] text-white/30">
            What Whale Intent Tracks
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            [
              "Accumulation",
              "Changes in large-wallet holdings and sustained withdrawal behavior.",
            ],
            [
              "Distribution",
              "Potential reductions in large-wallet exposure and exchange-directed movement.",
            ],
            [
              "Exchange Flows",
              "Large-wallet transfers involving identified exchange addresses.",
            ],
            [
              "Dormant Activation",
              "Previously inactive large wallets becoming active again.",
            ],
            [
              "Unusual Transfers",
              "Large or repeated transfers that differ from recent wallet behavior.",
            ],
            [
              "Behavioral Score",
              "Multiple observable signals combined into a directional behavioral classification.",
            ],
          ].map(([title, body]) => (
            <div
              key={title}
              className="rounded-lg border border-white/5 bg-black/10 p-4"
            >
              <div className="text-xs font-medium text-white/70">
                {title}
              </div>

              <div className="mt-1 text-[10px] leading-relaxed text-white/30">
                {body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------
          NOTICE
      ------------------------------------------------- */}

      <div className="flex gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.035] p-4">
        <ShieldAlert
          size={16}
          className="mt-0.5 shrink-0 text-amber-300/70"
        />

        <div>
          <div className="text-xs font-medium text-amber-200/80">
            Observable behavior, not certainty
          </div>

          <div className="mt-1 text-[10px] leading-relaxed text-white/35">
            Whale Intent interprets observable blockchain activity.
            Wallet ownership, transfer purpose and future trading
            decisions cannot always be determined from blockchain
            movements alone.
          </div>
        </div>
      </div>

      {/* -------------------------------------------------
          METHODOLOGY
      ------------------------------------------------- */}

      <HowWhaleIntentWorks />

      {/* -------------------------------------------------
          FOOTER
      ------------------------------------------------- */}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/5 pt-3 text-[9px] text-white/25">
        <span>
          Whale Intent • On-chain Intelligence
        </span>

        <span>
          Observable on-chain behavior
        </span>

        <span>
          Development Mode
        </span>

        <span>
          Not financial advice
        </span>
      </div>
    </div>
  );
}
