"use client";

import { useMarket } from "@/lib/providers/MarketProvider";

function getStrengthClass(strength: string) {
  switch (strength) {
    case "STRONG":
      return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";

    case "DEVELOPING":
      return "text-cyan-300 bg-cyan-500/10 border-cyan-500/20";

    default:
      return "text-yellow-300 bg-yellow-500/10 border-yellow-500/20";
  }
}

function getDirectionClass(direction: string) {
  return direction === "BULLISH"
    ? "text-emerald-300"
    : "text-red-300";
}

function getSignalTypeLabel(type: string) {
  return type.replaceAll("_", " ");
}

export default function AlphaSignals() {
  const { alphaSignals } = useMarket();

  if (!alphaSignals) {
    return (
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Alpha Signals
            </h3>

            <p className="text-xs text-gray-400 mt-1">
              Early opportunity detection
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-300">
            PREMIUM
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center">
          <p className="text-sm text-gray-400">
            Waiting for sufficient market history...
          </p>

          <p className="text-xs text-gray-600 mt-2">
            Alpha Signals requires historical observations before
            generating opportunities.
          </p>
        </div>
      </div>
    );
  }

  const {
    signals,
    topOpportunity,
    marketOpportunityCount,
    bullishCount,
    bearishCount,
    generatedAt,
  } = alphaSignals;

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-5">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Alpha Signals
          </h3>

          <p className="text-xs text-gray-400 mt-1">
            Early market opportunity detection
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-300">
          PREMIUM
        </span>
      </div>

      {/* MARKET SUMMARY */}
      <div className="grid grid-cols-3 gap-3 mb-5">

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-500">
            Opportunities
          </p>

          <p className="text-xl font-semibold text-white mt-1">
            {marketOpportunityCount}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-500">
            Bullish
          </p>

          <p className="text-xl font-semibold text-emerald-300 mt-1">
            {bullishCount}
          </p>
        </div>

        <div className="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-500">
            Bearish
          </p>

          <p className="text-xl font-semibold text-red-300 mt-1">
            {bearishCount}
          </p>
        </div>

      </div>

      {/* TOP OPPORTUNITY */}
      {topOpportunity && (
        <div className="rounded-xl border border-violet-400/20 bg-violet-500/[0.05] p-4 mb-5">

          <div className="flex items-center justify-between mb-3">

            <div>
              <p className="text-[10px] uppercase tracking-wide text-violet-300/70">
                Top Opportunity
              </p>

              <p className="text-xl font-semibold text-white mt-1">
                {topOpportunity.symbol}
              </p>
            </div>

            <div className="text-right">
              <p
                className={`text-sm font-semibold ${getDirectionClass(
                  topOpportunity.direction
                )}`}
              >
                {topOpportunity.direction}
              </p>

              <p className="text-xs text-gray-500">
                Score {topOpportunity.score}
              </p>
            </div>

          </div>

          <p className="text-xs text-gray-400">
            {topOpportunity.explanation}
          </p>

          <div className="flex items-center gap-2 mt-3">

            <span
              className={`text-[10px] px-2 py-1 rounded-md border ${getStrengthClass(
                topOpportunity.strength
              )}`}
            >
              {topOpportunity.strength}
            </span>

            <span className="text-[10px] px-2 py-1 rounded-md border border-white/10 text-gray-400">
              {getSignalTypeLabel(topOpportunity.type)}
            </span>

            <span className="text-[10px] px-2 py-1 rounded-md border border-white/10 text-gray-400">
              Confidence {topOpportunity.confidence}%
            </span>

          </div>

        </div>
      )}

      {/* SIGNAL LIST */}
      <div className="space-y-3">

        {signals.map((signal) => (
          <div
            key={`${signal.symbol}-${signal.triggeredAt}`}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >

            <div className="flex items-center justify-between">

              <div>
                <p className="font-medium text-white">
                  {signal.symbol}
                </p>

                <p className="text-[10px] text-gray-500 mt-1">
                  {getSignalTypeLabel(signal.type)}
                </p>
              </div>

              <div className="text-right">

                <p
                  className={`text-sm font-semibold ${getDirectionClass(
                    signal.direction
                  )}`}
                >
                  {signal.direction}
                </p>

                <p className="text-xs text-gray-500">
                  Score {signal.score}
                </p>

              </div>

            </div>

            <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-violet-400"
                style={{
                  width: `${signal.score}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-3">

              <span
                className={`text-[10px] px-2 py-1 rounded-md border ${getStrengthClass(
                  signal.strength
                )}`}
              >
                {signal.strength}
              </span>

              <span className="text-[10px] text-gray-500">
                Confidence {signal.confidence}%
              </span>

            </div>

            <p className="text-xs text-gray-400 mt-3">
              {signal.explanation}
            </p>

          </div>
        ))}

      </div>

      {/* EMPTY STATE */}
      {!signals.length && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center">
          <p className="text-sm text-gray-400">
            No qualifying alpha opportunities detected.
          </p>

          <p className="text-xs text-gray-600 mt-2">
            The engine is monitoring momentum, relative strength,
            volume, sector rotation, breadth, and persistence.
          </p>
        </div>
      )}

      {/* HOW ALPHA SIGNALS WORK */}
      <details className="mt-5 border-t border-white/10 pt-4 group">
        <summary className="cursor-pointer list-none flex items-center justify-between text-xs text-gray-400 hover:text-gray-200 transition-colors">
          <span>? How Alpha Signals Works</span>

          <span className="text-gray-600 group-open:rotate-180 transition-transform">
            ?
          </span>
        </summary>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">

          <p className="text-[10px] uppercase tracking-wide text-violet-300/70 mb-4">
            HOW ALPHA SIGNALS WORKS
          </p>

          <div className="space-y-3">

            <div className="text-sm text-gray-300">
              <span className="font-medium text-white">
                6 market factors
              </span>
              <p className="text-[11px] text-gray-500 mt-1">
                Momentum, relative strength, market activity, sector
                strength, market breadth, and persistence.
              </p>
            </div>

            <div className="text-center text-gray-600">
              ?
            </div>

            <div className="text-sm text-gray-300">
              <span className="font-medium text-white">
                Multi-factor confirmation
              </span>
              <p className="text-[11px] text-gray-500 mt-1">
                The engine looks for multiple independent conditions
                pointing in the same direction.
              </p>
            </div>

            <div className="text-center text-gray-600">
              ?
            </div>

            <div className="text-sm text-gray-300">
              <span className="font-medium text-white">
                Directional scoring
              </span>
              <p className="text-[11px] text-gray-500 mt-1">
                Bullish and bearish evidence is evaluated to determine
                the dominant market direction.
              </p>
            </div>

            <div className="text-center text-gray-600">
              ?
            </div>

            <div className="text-sm text-gray-300">
              <span className="font-medium text-white">
                Confidence assessment
              </span>
              <p className="text-[11px] text-gray-500 mt-1">
                Confidence reflects the amount and quality of
                independent confirmation behind the signal.
              </p>
            </div>

            <div className="text-center text-gray-600">
              ?
            </div>

            <div className="text-sm text-gray-300">
              <span className="font-medium text-white">
                Alpha Score 0–100
              </span>
              <p className="text-[11px] text-gray-500 mt-1">
                Higher scores indicate stronger multi-factor
                opportunity conditions.
              </p>
            </div>

            <div className="text-center text-gray-600">
              ?
            </div>

            <div className="text-sm text-gray-300">
              <span className="font-medium text-white">
                WATCH / DEVELOPING / STRONG
              </span>
              <p className="text-[11px] text-gray-500 mt-1">
                Signals are classified according to their Alpha Score.
              </p>
            </div>

          </div>

          <p className="text-[10px] text-gray-600 mt-5 pt-4 border-t border-white/10">
            Alpha Signals identify emerging market conditions. They are
            probabilistic signals, not guarantees of future price movement.
          </p>

        </div>
      </details>

      {/* FOOTER */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
        <p className="text-[10px] text-gray-600">
          Generated {new Date(generatedAt).toLocaleTimeString()}
        </p>

        <p className="text-[10px] text-gray-600">
          Experimental Alpha Engine
        </p>
      </div>

    </div>
  );
}
