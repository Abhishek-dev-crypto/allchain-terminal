"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Brain,
  ChevronDown,
  Gauge,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Waves,
} from "lucide-react";

/* =========================================================
   TYPES — MUST MATCH /api/intelligence/regime
========================================================= */

type ForecastRegime =
  | "BULLISH"
  | "BEARISH"
  | "NEUTRAL"
  | "TRANSITION";

type TransitionDirection =
  | "BULLISH"
  | "BEARISH"
  | "UNCERTAIN";

type FactorState = {
  momentum:
    | "POSITIVE"
    | "NEGATIVE"
    | "NEUTRAL";

  volatility:
    | "EXPANDING"
    | "CONTRACTING"
    | "STABLE";

  liquidity:
    | "RISING"
    | "FALLING"
    | "STABLE";

  structure:
    | "BULLISH"
    | "BEARISH"
    | "RANGE";

  stability:
    | "STABLE"
    | "UNSTABLE"
    | "TRANSITIONING";
};

type RegimeSignal = {
  asset: string;
  symbol: string;

  currentRegime: ForecastRegime;
  previousRegime?: ForecastRegime;

  forecastRegime: ForecastRegime;

  confidence: number;
  shiftProbability: number;

  horizon: "7D";

  momentum: number;
  volatility: number;
  liquidity: number;
  marketStructure: number;
  trendStability: number;

  transitionDirection: TransitionDirection;

  factors: FactorState;

  updatedAt: string;
};

type RegimeResponse = {
  signals: RegimeSignal[];

  meta?: {
    horizon?: string;
    engine?: string;
    methodology?: string;
    generatedAt?: string;
  };
};

/* =========================================================
   HELPERS
========================================================= */

function regimeLabel(
  regime: ForecastRegime
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
  regime: ForecastRegime
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
  regime: ForecastRegime
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
  regime: ForecastRegime
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

function transitionLabel(
  direction: TransitionDirection
) {
  switch (direction) {
    case "BULLISH":
      return "Bullish";

    case "BEARISH":
      return "Bearish";

    default:
      return "Uncertain";
  }
}

function continuationDescription(
  signal: RegimeSignal
) {
  if (
    signal.currentRegime ===
      signal.forecastRegime &&
    signal.currentRegime !== "TRANSITION"
  ) {
    return `The ${regimeLabel(
      signal.currentRegime
    ).toLowerCase()} regime remains aligned with the current multi-timeframe market evidence.`;
  }

  if (
    signal.forecastRegime ===
    "TRANSITION"
  ) {
    return "Current market conditions show elevated evidence of a potential regime transition.";
  }

  return `The model's projected regime is ${regimeLabel(
    signal.forecastRegime
  ).toLowerCase()} based on the current market evidence.`;
}

function shiftRiskLabel(
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
   METHODOLOGY
========================================================= */

function Methodology() {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-white/[0.025]"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Brain
            size={14}
            className="text-cyan-300/70"
          />

          <div>
            <div className="text-xs font-medium text-white/75">
              How Regime Forecast Works
            </div>

            <div className="mt-1 text-[9px] text-white/25">
              Deterministic multi-timeframe
              regime analysis.
            </div>
          </div>
        </div>

        <ChevronDown
          size={15}
          className={`text-white/25 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-white/5 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-white/5 bg-black/10 p-4">
              <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-cyan-300/60">
                Current regime
              </div>

              <div className="mt-2 text-[10px] leading-relaxed text-white/35">
                The current regime is primarily
                determined from the 4H market
                regime detector.
              </div>
            </div>

            <div className="rounded-lg border border-white/5 bg-black/10 p-4">
              <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-cyan-300/60">
                Multi-timeframe evidence
              </div>

              <div className="mt-2 text-[10px] leading-relaxed text-white/35">
                Momentum is evaluated across
                1H, 4H and 1D data, while
                volatility combines 1H and 4H
                conditions.
              </div>
            </div>

            <div className="rounded-lg border border-white/5 bg-black/10 p-4">
              <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-cyan-300/60">
                Market structure
              </div>

              <div className="mt-2 text-[10px] leading-relaxed text-white/35">
                Recent 4H highs and lows are
                evaluated for bullish, bearish
                or range structure.
              </div>
            </div>

            <div className="rounded-lg border border-white/5 bg-black/10 p-4">
              <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-cyan-300/60">
                Transition risk
              </div>

              <div className="mt-2 text-[10px] leading-relaxed text-white/35">
                Transition scoring incorporates
                directional disagreement, market
                stability, volatility, liquidity
                and changes in the detected
                regime.
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-3 rounded-lg border border-amber-400/15 bg-amber-400/[0.035] p-4">
            <ShieldAlert
              size={15}
              className="mt-0.5 shrink-0 text-amber-300/70"
            />

            <div>
              <div className="text-[10px] font-medium text-amber-200/80">
                Forecast limitation
              </div>

              <div className="mt-1 text-[10px] leading-relaxed text-white/35">
                Regime Forecast is a deterministic
                market-regime model based on
                observable market data. It does
                not guarantee future market
                conditions or price movement and
                is not financial advice.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RegimeForecast() {
  const [data, setData] =
    useState<RegimeResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedSymbol, setSelectedSymbol] =
    useState<string | null>(null);

  const [lastUpdated, setLastUpdated] =
    useState<number | null>(null);

  /* =======================================================
     API
  ======================================================= */

  async function loadForecast() {
    try {
      setLoading(true);
      setError(null);

      const controller =
        new AbortController();

      const timeout = setTimeout(
        () => controller.abort(),
        15_000
      );

      try {
        const response = await fetch(
          "/api/intelligence/regime",
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Regime forecast request failed"
          );
        }

        const result =
          (await response.json()) as RegimeResponse;

        if (
          !result ||
          !Array.isArray(result.signals)
        ) {
          throw new Error(
            "Invalid regime forecast response"
          );
        }

        setData(result);
        setLastUpdated(Date.now());

        /*
         * Select the first REAL asset returned
         * by the backend.
         *
         * No hardcoded market selection.
         */
        setSelectedSymbol(
          (current) =>
            current ??
            result.signals[0]?.symbol ??
            null
        );
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      console.error(
        "Regime Forecast API error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Regime forecast unavailable"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadForecast();

    const interval = setInterval(
      loadForecast,
      60_000
    );

    return () =>
      clearInterval(interval);
  }, []);

  /* =======================================================
     SELECTED SIGNAL
  ======================================================= */

  const signal = useMemo(() => {
    if (!data?.signals?.length) {
      return null;
    }

    return (
      data.signals.find(
        (item) =>
          item.symbol === selectedSymbol
      ) ??
      data.signals[0] ??
      null
    );
  }, [data, selectedSymbol]);

  /* =======================================================
     EMPTY / ERROR
  ======================================================= */

  if (
    !loading &&
    !signal
  ) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Gauge
                size={15}
                className="text-cyan-300"
              />

              <div className="text-[9px] uppercase tracking-[0.3em] text-cyan-300/70">
                Market Structure Intelligence
              </div>
            </div>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Regime Forecast
            </h2>

            <p className="mt-1 text-xs text-white/35">
              Multi-timeframe market regime analysis.
            </p>
          </div>

          <button
            type="button"
            onClick={loadForecast}
            className="rounded-md border border-white/10 bg-white/[0.025] p-2 text-white/35 transition hover:bg-white/[0.05] hover:text-white/60"
            title="Refresh"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
          <ShieldAlert
            size={18}
            className="mx-auto text-amber-300/70"
          />

          <div className="mt-3 text-xs text-white/60">
            {error
              ? "Regime forecast unavailable."
              : "No regime data available."}
          </div>

          <div className="mt-1 text-[10px] text-white/25">
            No fallback or synthetic market data
            is displayed.
          </div>
        </div>
      </div>
    );
  }

  if (loading && !signal) {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Gauge
              size={15}
              className="text-cyan-300"
            />

            <div className="text-[9px] uppercase tracking-[0.3em] text-cyan-300/70">
              Market Structure Intelligence
            </div>
          </div>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Regime Forecast
          </h2>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <RefreshCw
            size={16}
            className="mx-auto animate-spin text-cyan-300/60"
          />

          <div className="mt-3 text-xs text-white/40">
            Loading live regime intelligence…
          </div>
        </div>
      </div>
    );
  }

  if (!signal || !data) {
  return null;
}

const currentRegime =
  signal.currentRegime;

  const forecastRegime =
    signal.forecastRegime;

  const sameRegime =
    currentRegime ===
    forecastRegime;

  return (
    <div className="space-y-4">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Gauge
              size={15}
              className="text-cyan-300"
            />

            <div className="text-[9px] uppercase tracking-[0.3em] text-cyan-300/70">
              Market Structure Intelligence
            </div>
          </div>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Regime Forecast
          </h2>

          <p className="mt-1 max-w-2xl text-xs text-white/35">
            Multi-timeframe analysis of current
            regime conditions and transition risk.
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
            onClick={loadForecast}
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
          ASSET SELECTOR — ONLY REAL API ASSETS
      ================================================= */}

      {data.signals.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {data.signals.map(
            (item) => (
              <button
                key={item.symbol}
                type="button"
                onClick={() =>
                  setSelectedSymbol(
                    item.symbol
                  )
                }
                className={`rounded-lg border px-3 py-2 text-[10px] font-medium transition ${
                  item.symbol ===
                  signal.symbol
                    ? "border-cyan-300/25 bg-cyan-300/[0.06] text-cyan-300"
                    : "border-white/10 bg-white/[0.02] text-white/35 hover:bg-white/[0.04] hover:text-white/60"
                }`}
              >
                {item.symbol}
              </button>
            )
          )}
        </div>
      )}

      {/* =================================================
          CORE
      ================================================= */}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">

        {/* Current / Forecast */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-6 ${regimeBg(
            currentRegime
          )}`}
        >
          <div className="relative">

            <div className="flex items-center gap-2">
              <Sparkles
                size={14}
                className="text-cyan-300/70"
              />

              <span className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                {signal.horizon} regime outlook
              </span>

              <span className="ml-auto text-[10px] font-medium text-white/40">
                {signal.symbol}
              </span>
            </div>

            <div className="mt-5 grid gap-6 md:grid-cols-2">

              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/25">
                  Current regime
                </div>

                <div
                  className={`mt-1 flex items-center gap-2 text-3xl font-semibold ${regimeColor(
                    currentRegime
                  )}`}
                >
                  {regimeIcon(
                    currentRegime
                  )}

                  {regimeLabel(
                    currentRegime
                  )}
                </div>

                <div className="mt-3 text-xs leading-relaxed text-white/35">
                  {continuationDescription(
                    signal
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/10 p-4 text-center">
                <div className="text-[8px] uppercase tracking-[0.18em] text-white/20">
                  Forecast confidence
                </div>

                <div className="mt-1 text-3xl font-semibold text-white/80">
                  {signal.confidence}%
                </div>

                <div className="mt-1 text-[9px] text-white/25">
                  {signal.horizon} horizon
                </div>
              </div>

            </div>

            {/* Regime path */}
            <div className="mt-7 flex items-center gap-3">

              <div
                className={`rounded-lg border px-3 py-2 ${regimeBg(
                  currentRegime
                )}`}
              >
                <div className="text-[8px] uppercase tracking-wider text-white/20">
                  Current
                </div>

                <div
                  className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${regimeColor(
                    currentRegime
                  )}`}
                >
                  {regimeIcon(
                    currentRegime
                  )}

                  {regimeLabel(
                    currentRegime
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
                  forecastRegime
                )}`}
              >
                <div className="text-[8px] uppercase tracking-wider text-white/20">
                  Outlook
                </div>

                <div
                  className={`mt-1 text-[11px] font-medium ${regimeColor(
                    forecastRegime
                  )}`}
                >
                  {regimeLabel(
                    forecastRegime
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Transition risk */}
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
  {signal.shiftProbability}
</div>

<div className="mt-1 text-[10px] text-white/25">
  model transition score / 100
</div>
            </div>

            <div
              className={`rounded-lg border px-2.5 py-1.5 text-[9px] uppercase tracking-wider ${
                signal.shiftProbability >=
                70
                  ? "border-amber-400/20 bg-amber-400/[0.06] text-amber-300"
                  : signal.shiftProbability >=
                    40
                  ? "border-cyan-400/15 bg-cyan-400/[0.04] text-cyan-300"
                  : "border-emerald-400/15 bg-emerald-400/[0.04] text-emerald-300"
              }`}
            >
              {shiftRiskLabel(
                signal.shiftProbability
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
                    signal.shiftProbability
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
              Direction
            </div>

            <div
              className={`mt-1 text-[11px] font-medium ${regimeColor(
                signal.transitionDirection ===
                  "BULLISH"
                  ? "BULLISH"
                  : signal.transitionDirection ===
                    "BEARISH"
                  ? "BEARISH"
                  : "NEUTRAL"
              )}`}
            >
              {transitionLabel(
                signal.transitionDirection
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          MARKET FACTORS
      ================================================= */}

      <div className="grid gap-4 lg:grid-cols-2">

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
              value={signal.momentum}
            />

            <ScoreBar
              label="Volatility"
              value={signal.volatility}
            />

            <ScoreBar
              label="Liquidity"
              value={signal.liquidity}
            />

            <ScoreBar
              label="Market Structure"
              value={
                signal.marketStructure
              }
            />

            <ScoreBar
              label="Trend Stability"
              value={
                signal.trendStability
              }
            />
          </div>
        </div>

        {/* Factor states */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

          <div className="flex items-center gap-2">
            <Brain
              size={14}
              className="text-violet-300/60"
            />

            <div className="text-[9px] uppercase tracking-[0.2em] text-white/25">
              Factor States
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <FactorStateRow
              label="Momentum"
              state={
                signal.factors.momentum
              }
            />

            <FactorStateRow
              label="Volatility"
              state={
                signal.factors.volatility
              }
            />

            <FactorStateRow
              label="Liquidity"
              state={
                signal.factors.liquidity
              }
            />

            <FactorStateRow
              label="Structure"
              state={
                signal.factors.structure
              }
            />

            <FactorStateRow
              label="Stability"
              state={
                signal.factors.stability
              }
            />
          </div>
        </div>
      </div>

      {/* =================================================
          REGIME TRANSITION
      ================================================= */}

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

        <div className="flex items-center gap-2">
          <Waves
            size={14}
            className="text-cyan-300/60"
          />

          <div className="text-[9px] uppercase tracking-[0.2em] text-white/25">
            Regime Transition
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">

          <div className="rounded-lg border border-white/5 bg-black/10 p-4">
            <div className="text-[8px] uppercase tracking-wider text-white/20">
              Previous
            </div>

            <div
              className={`mt-1 text-sm font-medium ${regimeColor(
                signal.previousRegime ??
                  currentRegime
              )}`}
            >
              {regimeLabel(
                signal.previousRegime ??
                  currentRegime
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-black/10 p-4">
            <div className="text-[8px] uppercase tracking-wider text-white/20">
              Current
            </div>

            <div
              className={`mt-1 text-sm font-medium ${regimeColor(
                currentRegime
              )}`}
            >
              {regimeLabel(
                currentRegime
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-black/10 p-4">
            <div className="text-[8px] uppercase tracking-wider text-white/20">
              7D Outlook
            </div>

            <div
              className={`mt-1 text-sm font-medium ${regimeColor(
                forecastRegime
              )}`}
            >
              {regimeLabel(
                forecastRegime
              )}
            </div>
          </div>

        </div>

        <div className="mt-4 text-[10px] leading-relaxed text-white/30">
          {sameRegime
            ? "The projected regime remains aligned with the currently detected regime."
            : "The projected regime differs from the currently detected regime, indicating changing market conditions."}
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
            Regime Forecast evaluates observable
            market conditions using deterministic
            multi-timeframe indicators. Transition
            scores represent model output and are
            not guarantees of future market
            conditions.
          </div>
        </div>
      </div>

      {/* =================================================
          METHODOLOGY
      ================================================= */}

      <Methodology />

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/5 pt-3 text-[9px] text-white/20">

        <span>
          Regime Forecast • Market Structure
          Intelligence
        </span>

        <span>
          {data.meta?.engine ??
            "Regime Forecast Engine"}
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