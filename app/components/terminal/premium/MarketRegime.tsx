"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Brain,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Waves,
} from "lucide-react";

/* =========================================================
   TYPES — MUST MATCH /api/intelligence/market-regime
========================================================= */

type MarketRegime =
  | "BULLISH"
  | "BEARISH"
  | "NEUTRAL"
  | "TRANSITION";

type FactorState = {
  momentum:
    | "POSITIVE"
    | "NEGATIVE"
    | "NEUTRAL";

  breadth:
    | "BULLISH"
    | "BEARISH"
    | "MIXED";

  liquidity:
    | "RISING"
    | "FALLING"
    | "STABLE";

  structure:
    | "BULLISH"
    | "BEARISH"
    | "RANGE";

  volatility:
    | "EXPANDING"
    | "CONTRACTING"
    | "STABLE";

  stability:
    | "STABLE"
    | "UNSTABLE"
    | "TRANSITIONING";
};

type MarketRegimeResponse = {
  currentRegime: MarketRegime;
  forecastRegime: MarketRegime;

  confidence: number;
  transitionRisk: number;

  horizon: "7D";

  momentum: number;
  breadth: number;
  liquidity: number;
  marketStructure: number;
  volatility: number;
  trendStability: number;
  participation: number;

  factors: FactorState;

  assetsAnalyzed: number;

  updatedAt: string;

  meta?: {
    engine?: string;
    methodology?: string;
    horizon?: string;
  };
};

/* =========================================================
   HELPERS
========================================================= */

function regimeLabel(
  regime: MarketRegime
) {
  switch (regime) {
    case "BULLISH":
      return "Bullish";

    case "BEARISH":
      return "Bearish";

    case "TRANSITION":
      return "Transition";

    default:
      return "Neutral";
  }
}

function regimeColor(
  regime: MarketRegime
) {
  switch (regime) {
    case "BULLISH":
      return "text-emerald-300";

    case "BEARISH":
      return "text-red-300";

    case "TRANSITION":
      return "text-amber-300";

    default:
      return "text-white/60";
  }
}

function regimeBg(
  regime: MarketRegime
) {
  switch (regime) {
    case "BULLISH":
      return "border-emerald-400/20 bg-emerald-400/[0.06]";

    case "BEARISH":
      return "border-red-400/20 bg-red-400/[0.06]";

    case "TRANSITION":
      return "border-amber-400/20 bg-amber-400/[0.06]";

    default:
      return "border-white/10 bg-white/[0.025]";
  }
}

function regimeIcon(
  regime: MarketRegime
) {
  switch (regime) {
    case "BULLISH":
      return <ArrowUpRight size={14} />;

    case "BEARISH":
      return <ArrowDownRight size={14} />;

    case "TRANSITION":
      return <Activity size={14} />;

    default:
      return <ArrowRight size={14} />;
  }
}

function transitionRiskLabel(
  value: number
) {
  if (value >= 70) return "Elevated";
  if (value >= 40) return "Moderate";
  return "Contained";
}

/* =========================================================
   SCORE BAR
========================================================= */

function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/35">
          {label}
        </span>

        <span className="text-[10px] text-white/55">
          {value}
        </span>
      </div>

      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-cyan-400/50 transition-all"
          style={{
            width: `${Math.min(
              100,
              Math.max(0, value)
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   FACTOR STATE
========================================================= */

function FactorStateRow({
  label,
  state,
}: {
  label: string;
  state: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/10 px-3 py-2.5">
      <span className="text-[9px] uppercase tracking-wider text-white/25">
        {label}
      </span>

      <span className="text-[10px] font-medium text-white/60">
        {state}
      </span>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MarketRegime() {
  const [data, setData] =
    useState<MarketRegimeResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [lastUpdated, setLastUpdated] =
    useState<number | null>(null);

  /* =======================================================
     API
  ======================================================= */

  async function loadMarketRegime() {
    try {
      setLoading(true);
      setError(null);

      const controller =
        new AbortController();

      const timeout = setTimeout(
        () => controller.abort(),
        30_000
      );

      try {
        const response = await fetch(
          "/api/intelligence/market-regime",
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Market regime request failed"
          );
        }

        const result =
          (await response.json()) as MarketRegimeResponse;

        if (
          !result ||
          !result.currentRegime ||
          !result.forecastRegime
        ) {
          throw new Error(
            "Invalid market regime response"
          );
        }

        setData(result);
        setLastUpdated(Date.now());
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      console.error(
        "Market Regime API error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Market regime unavailable"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarketRegime();

    const interval = setInterval(
      loadMarketRegime,
      60_000
    );

    return () =>
      clearInterval(interval);
  }, []);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading && !data) {
    return (
      <div className="space-y-4">

        <div>
          <div className="flex items-center gap-2">
            <GaugeIcon />

            <div className="text-[9px] uppercase tracking-[0.3em] text-cyan-300/70">
              Crypto Market Intelligence
            </div>
          </div>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Market Regime
          </h2>

          <p className="mt-1 text-xs text-white/35">
            Cross-asset market regime analysis.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <RefreshCw
            size={16}
            className="mx-auto animate-spin text-cyan-300/60"
          />

          <div className="mt-3 text-xs text-white/40">
            Loading live market regime intelligence…
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR / EMPTY
  ======================================================= */

  if (!data) {
    return (
      <div className="space-y-4">

        <div>
          <div className="flex items-center gap-2">
            <GaugeIcon />

            <div className="text-[9px] uppercase tracking-[0.3em] text-cyan-300/70">
              Crypto Market Intelligence
            </div>
          </div>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Market Regime
          </h2>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <ShieldAlert
            size={18}
            className="mx-auto text-amber-300/70"
          />

          <div className="mt-3 text-xs text-white/60">
            Market regime unavailable.
          </div>

          <div className="mt-1 text-[10px] text-white/25">
            No fallback or synthetic market data
            is displayed.
          </div>

          {error && (
            <div className="mt-2 text-[9px] text-white/20">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  const sameRegime =
    data.currentRegime ===
    data.forecastRegime;

  return (
    <div className="space-y-4">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-start justify-between gap-4">

        <div>
          <div className="flex items-center gap-2">
            <GaugeIcon />

            <div className="text-[9px] uppercase tracking-[0.3em] text-cyan-300/70">
              Crypto Market Intelligence
            </div>
          </div>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Market Regime
          </h2>

          <p className="mt-1 max-w-2xl text-xs text-white/35">
            Cross-asset multi-timeframe analysis of
            current market conditions and 7D regime
            outlook.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <div className="hidden items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.025] px-2.5 py-1.5 sm:flex">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                loading
                  ? "bg-amber-400"
                  : error
                  ? "bg-red-400"
                  : "bg-emerald-400"
              }`}
            />

            <span className="text-[9px] uppercase tracking-wider text-white/30">
              {loading
                ? "Updating"
                : error
                ? "Stale"
                : "Live"}
            </span>
          </div>

          <button
            type="button"
            onClick={loadMarketRegime}
            disabled={loading}
            className="rounded-md border border-white/10 bg-white/[0.025] p-2 text-white/35 transition hover:bg-white/[0.05] hover:text-white/60 disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw
              size={13}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

        </div>
      </div>

      {/* =================================================
          CORE MARKET REGIME
      ================================================= */}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">

        {/* CURRENT / OUTLOOK */}

        <div
          className={`relative overflow-hidden rounded-2xl border p-6 ${regimeBg(
            data.currentRegime
          )}`}
        >

          <div className="relative">

            <div className="flex items-center gap-2">

              <Sparkles
                size={14}
                className="text-cyan-300/70"
              />

              <span className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                {data.horizon} market outlook
              </span>

              <span className="ml-auto text-[10px] text-white/30">
                {data.assetsAnalyzed} assets analyzed
              </span>

            </div>

            <div className="mt-5 grid gap-6 md:grid-cols-2">

              {/* CURRENT */}

              <div>

                <div className="text-[10px] uppercase tracking-wider text-white/25">
                  Current market regime
                </div>

                <div
                  className={`mt-1 flex items-center gap-2 text-3xl font-semibold ${regimeColor(
                    data.currentRegime
                  )}`}
                >
                  {regimeIcon(
                    data.currentRegime
                  )}

                  {regimeLabel(
                    data.currentRegime
                  )}
                </div>

                <div className="mt-3 text-xs leading-relaxed text-white/35">
                  Current conditions are derived from
                  cross-asset market evidence across
                  multiple timeframes.
                </div>

              </div>

              {/* CONFIDENCE */}

              <div className="rounded-xl border border-white/10 bg-black/10 p-4 text-center">

                <div className="text-[8px] uppercase tracking-[0.18em] text-white/20">
                  Model confidence
                </div>

                <div className="mt-1 text-3xl font-semibold text-white/80">
                  {data.confidence}
                </div>

                <div className="mt-1 text-[9px] text-white/25">
                  confidence score / 100
                </div>

              </div>

            </div>

            {/* REGIME PATH */}

            <div className="mt-7 flex items-center gap-3">

              <div
                className={`rounded-lg border px-3 py-2 ${regimeBg(
                  data.currentRegime
                )}`}
              >
                <div className="text-[8px] uppercase tracking-wider text-white/20">
                  Current
                </div>

                <div
                  className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${regimeColor(
                    data.currentRegime
                  )}`}
                >
                  {regimeIcon(
                    data.currentRegime
                  )}

                  {regimeLabel(
                    data.currentRegime
                  )}
                </div>
              </div>

              <div className="flex flex-1 items-center gap-2">

                <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-cyan-300/30 to-white/10" />

                <div className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.04] p-2 text-cyan-300/60">
                  <ArrowRight size={13} />
                </div>

                <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-cyan-300/30 to-white/10" />

              </div>

              <div
                className={`rounded-lg border px-3 py-2 ${regimeBg(
                  data.forecastRegime
                )}`}
              >

                <div className="text-[8px] uppercase tracking-wider text-white/20">
                  7D Outlook
                </div>

                <div
                  className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${regimeColor(
                    data.forecastRegime
                  )}`}
                >
                  {regimeIcon(
                    data.forecastRegime
                  )}

                  {regimeLabel(
                    data.forecastRegime
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* TRANSITION RISK */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">

          <div className="flex items-center gap-2">

            <Waves
              size={14}
              className="text-violet-300/70"
            />

            <div className="text-[9px] uppercase tracking-[0.2em] text-white/25">
              Transition Risk
            </div>

          </div>

          <div className="mt-6 flex items-end justify-between">

            <div>

              <div className="text-3xl font-semibold text-white/80">
                {data.transitionRisk}
              </div>

              <div className="mt-1 text-[10px] text-white/25">
                model transition score / 100
              </div>

            </div>

            <div
              className={`rounded-lg border px-2.5 py-1.5 text-[9px] uppercase tracking-wider ${
                data.transitionRisk >= 70
                  ? "border-amber-400/20 bg-amber-400/[0.06] text-amber-300"
                  : data.transitionRisk >= 40
                  ? "border-cyan-400/15 bg-cyan-400/[0.04] text-cyan-300"
                  : "border-emerald-400/15 bg-emerald-400/[0.04] text-emerald-300"
              }`}
            >
              {transitionRiskLabel(
                data.transitionRisk
              )}
            </div>

          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">

            <div
              className="h-full rounded-full bg-cyan-400/60 transition-all"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    data.transitionRisk
                  )
                )}%`,
              }}
            />

          </div>

          <div className="mt-4 flex items-center justify-between text-[9px] text-white/20">
            <span>Contained</span>
            <span>Elevated</span>
          </div>

          <div className="mt-5 rounded-lg border border-white/5 bg-black/10 p-3">

            <div className="text-[8px] uppercase tracking-wider text-white/20">
              Outlook relationship
            </div>

            <div className="mt-1 text-[11px] font-medium text-white/60">
              {sameRegime
                ? "Regime continuation"
                : "Regime conditions changing"}
            </div>

          </div>

        </div>
      </div>

      {/* =================================================
          MARKET FACTORS
      ================================================= */}

      <div className="grid gap-4 lg:grid-cols-2">

        {/* SCORES */}

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

          <div className="flex items-center gap-2">

            <Activity
              size={14}
              className="text-cyan-300/60"
            />

            <div className="text-[9px] uppercase tracking-[0.2em] text-white/25">
              Market Factors
            </div>

          </div>

          <div className="mt-5 space-y-4">

            <ScoreBar
              label="Momentum"
              value={data.momentum}
            />

            <ScoreBar
              label="Market Breadth"
              value={data.breadth}
            />

            <ScoreBar
              label="Liquidity"
              value={data.liquidity}
            />

            <ScoreBar
              label="Market Structure"
              value={data.marketStructure}
            />

            <ScoreBar
              label="Volatility"
              value={data.volatility}
            />

            <ScoreBar
              label="Trend Stability"
              value={data.trendStability}
            />

            <ScoreBar
              label="Participation"
              value={data.participation}
            />

          </div>
        </div>

        {/* STATES */}

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

          <div className="flex items-center gap-2">

            <Brain
              size={14}
              className="text-violet-300/60"
            />

            <div className="text-[9px] uppercase tracking-[0.2em] text-white/25">
              Market Factor States
            </div>

          </div>

          <div className="mt-5 grid gap-2">

            <FactorStateRow
              label="Momentum"
              state={data.factors.momentum}
            />

            <FactorStateRow
              label="Breadth"
              state={data.factors.breadth}
            />

            <FactorStateRow
              label="Liquidity"
              state={data.factors.liquidity}
            />

            <FactorStateRow
              label="Structure"
              state={data.factors.structure}
            />

            <FactorStateRow
              label="Volatility"
              state={data.factors.volatility}
            />

            <FactorStateRow
              label="Stability"
              state={data.factors.stability}
            />

          </div>
        </div>
      </div>

      {/* =================================================
          INTERPRETATION
      ================================================= */}

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

        <div className="flex items-center gap-2">

          <Waves
            size={14}
            className="text-cyan-300/60"
          />

          <div className="text-[9px] uppercase tracking-[0.2em] text-white/25">
            Market Regime Interpretation
          </div>

        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">

          <div className="rounded-lg border border-white/5 bg-black/10 p-4">

            <div className="text-[8px] uppercase tracking-wider text-white/20">
              Current
            </div>

            <div
              className={`mt-1 text-sm font-medium ${regimeColor(
                data.currentRegime
              )}`}
            >
              {regimeLabel(
                data.currentRegime
              )}
            </div>

          </div>

          <div className="rounded-lg border border-white/5 bg-black/10 p-4">

            <div className="text-[8px] uppercase tracking-wider text-white/20">
              7D Outlook
            </div>

            <div
              className={`mt-1 text-sm font-medium ${regimeColor(
                data.forecastRegime
              )}`}
            >
              {regimeLabel(
                data.forecastRegime
              )}
            </div>

          </div>

          <div className="rounded-lg border border-white/5 bg-black/10 p-4">

            <div className="text-[8px] uppercase tracking-wider text-white/20">
              Transition Risk
            </div>

            <div className="mt-1 text-sm font-medium text-white/70">
              {data.transitionRisk}/100
            </div>

          </div>

        </div>

        <div className="mt-4 text-[10px] leading-relaxed text-white/30">
          {data.forecastRegime === "TRANSITION"
            ? "The market-wide model detects conditions consistent with an elevated transition environment rather than a clear directional regime."
            : sameRegime
            ? "The market-wide model currently projects continuation of the detected market regime."
            : "The market-wide model projects a change in regime based on the current cross-asset evidence."}
        </div>

      </div>

      {/* =================================================
          WARNING
      ================================================= */}

      <div className="flex gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.035] p-4">

        <ShieldAlert
          size={15}
          className="mt-0.5 shrink-0 text-amber-300/70"
        />

        <div>

          <div className="text-[10px] font-medium text-amber-200/80">
            Model-based market intelligence
          </div>

          <div className="mt-1 text-[10px] leading-relaxed text-white/35">
            Market Regime is generated from
            observable cross-asset market data using
            deterministic rules across multiple
            timeframes. Transition Risk and Confidence
            are model scores, not statistically
            calibrated probabilities or guarantees of
            future market conditions.
          </div>

        </div>
      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/5 pt-3 text-[9px] text-white/20">

        <span>
          Market Regime • Cross-Asset Intelligence
        </span>

        <span>
          {data.meta?.engine ??
            "Market Regime Forecast Engine"}
        </span>

        <span>
          {lastUpdated
            ? `Updated ${new Date(
                lastUpdated
              ).toLocaleTimeString()}`
            : "Waiting for data"}
        </span>

        <span>
          Not financial advice
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   SMALL ICON WRAPPER
========================================================= */

function GaugeIcon() {
  return (
    <div className="flex h-4 w-4 items-center justify-center rounded-full border border-cyan-300/20">
      <div className="h-1.5 w-1.5 rounded-full bg-cyan-300/70" />
    </div>
  );
}