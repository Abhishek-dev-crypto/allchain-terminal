"use client";

import { useMemo, useState, useRef, useEffect } from "react";

import { useMarket } from "@/lib/providers/MarketProvider";

import type {
  PredictiveDirection,
  PredictiveForecast,
} from "@/lib/intel/predictiveAI";

/* =========================================================
   HELPERS
========================================================= */

function getDirectionClass(
  direction: PredictiveDirection
) {
  switch (direction) {
    case "BULLISH":
      return "text-emerald-300";

    case "BEARISH":
      return "text-red-300";

    default:
      return "text-yellow-300";
  }
}

function getDirectionBackground(
  direction: PredictiveDirection
) {
  switch (direction) {
    case "BULLISH":
      return "border-emerald-500/20 bg-emerald-500/[0.05]";

    case "BEARISH":
      return "border-red-500/20 bg-red-500/[0.05]";

    default:
      return "border-yellow-500/20 bg-yellow-500/[0.05]";
  }
}

function getDirectionDot(
  direction: PredictiveDirection
) {
  switch (direction) {
    case "BULLISH":
      return "bg-emerald-400";

    case "BEARISH":
      return "bg-red-400";

    default:
      return "bg-yellow-400";
  }
}

function formatProbability(
  value: number
) {
  return `${Math.round(value)}%`;
}

/* =========================================================
   SEARCHABLE COIN SELECTOR
========================================================= */

function CoinSelector({
  symbols,
  value,
  onChange,
}: {
  symbols: string[];
  value: string;
  onChange: (symbol: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const filteredSymbols = useMemo(() => {
    const query = search.trim().toUpperCase();

    if (!query) {
      return symbols;
    }

    return symbols.filter((symbol) =>
      symbol.toUpperCase().includes(query)
    );
  }, [symbols, search]);

  function handleSelect(symbol: string) {
    onChange(symbol);
    setSearch("");
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full sm:w-56"
    >
      {/* SELECTOR BUTTON */}

      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);

          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
        }}
        className="
          flex w-full items-center justify-between
          rounded-lg
          border border-white/10
          bg-[#0B1220]
          px-3 py-2
          text-xs text-white
          transition-colors
          hover:border-cyan-400/30
        "
      >
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

          <span className="font-medium">
            {value || "Select coin"}
          </span>
        </div>

        <span
          className={`
            text-gray-500
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        >
          ↓
        </span>
      </button>

      {/* DROPDOWN */}

      {open && (
        <div
          className="
            absolute
            left-0
            right-0
            top-full
            z-50
            mt-2
            overflow-hidden
            rounded-xl
            border border-white/10
            bg-[#0B1220]
            shadow-2xl
          "
        >
          {/* SEARCH */}

          <div className="border-b border-white/10 p-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setOpen(false);
                  }
                }}
                placeholder="Search coin..."
                className="
                  w-full
                  rounded-lg
                  border border-white/10
                  bg-white/[0.04]
                  px-3 py-2
                  pr-8
                  text-xs
                  text-white
                  outline-none
                  placeholder:text-gray-600
                  focus:border-cyan-400/40
                "
              />

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-600">
                /
              </span>
            </div>
          </div>

          {/* COIN LIST */}

          <div className="max-h-64 overflow-y-auto p-1">
            {filteredSymbols.length > 0 ? (
              filteredSymbols.map((symbol) => {
                const isSelected =
                  symbol === value;

                return (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() =>
                      handleSelect(symbol)
                    }
                    className={`
                      flex w-full items-center
                      justify-between
                      rounded-lg
                      px-3 py-2
                      text-left
                      transition-colors
                      ${
                        isSelected
                          ? "bg-cyan-500/10 text-cyan-300"
                          : "text-gray-300 hover:bg-white/[0.05] hover:text-white"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          flex h-7 w-7
                          items-center justify-center
                          rounded-md
                          text-[9px]
                          font-bold
                          ${
                            isSelected
                              ? "bg-cyan-500/10 text-cyan-300"
                              : "bg-white/[0.05] text-gray-500"
                          }
                        `}
                      >
                        {symbol.slice(0, 3)}
                      </div>

                      <div>
                        <div className="text-xs font-medium">
                          {symbol}
                        </div>

                        <div className="text-[9px] text-gray-600">
                          Predictive forecast
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-cyan-400">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-6 text-center">
                <p className="text-xs text-gray-500">
                  No coins found
                </p>

                <p className="mt-1 text-[10px] text-gray-700">
                  Try another symbol
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}

          <div className="border-t border-white/10 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider text-gray-600">
                Market universe
              </span>

              <span className="text-[9px] text-gray-500">
                {symbols.length} coins
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   FORECAST CARD
========================================================= */

function ForecastCard({
  forecast,
}: {
  forecast: PredictiveForecast;
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        bg-white/[0.02]
        p-4
        ${getDirectionBackground(
          forecast.direction
        )}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
            Horizon
          </p>

          <p className="mt-1 text-base font-semibold text-white">
            {forecast.horizon}
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <span
              className={`
                h-2 w-2 rounded-full
                ${getDirectionDot(
                  forecast.direction
                )}
              `}
            />

            <span
              className={`
                text-xs font-semibold
                ${getDirectionClass(
                  forecast.direction
                )}
              `}
            >
              {forecast.direction}
            </span>
          </div>

          <p className="mt-1 text-[10px] text-gray-500">
            Score {Math.round(forecast.score)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-gray-500">
            Directional probability
          </span>

          <span
            className={`
              text-lg font-semibold
              ${getDirectionClass(
                forecast.direction
              )}
            `}
          >
           {forecast.direction !== "NEUTRAL" && (
  <div className="flex items-center justify-between">
    <span className="text-[10px] uppercase tracking-wide text-gray-500">
      Directional probability
    </span>

    <span
      className={`
        text-lg font-semibold
        ${getDirectionClass(
          forecast.direction
        )}
      `}
    >
      {forecast.direction === "BULLISH"
        ? formatProbability(
            forecast.bullishProbability
          )
        : formatProbability(
            forecast.bearishProbability
          )}
    </span>
  </div>
)}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">
              Bullish
            </span>

            <span className="text-gray-400">
              {formatProbability(
                forecast.bullishProbability
              )}
            </span>
          </div>

          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    forecast.bullishProbability
                  )
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">
              Neutral
            </span>

            <span className="text-gray-400">
              {formatProbability(
                forecast.neutralProbability
              )}
            </span>
          </div>

          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-yellow-400 transition-all"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    forecast.neutralProbability
                  )
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">
              Bearish
            </span>

            <span className="text-gray-400">
              {formatProbability(
                forecast.bearishProbability
              )}
            </span>
          </div>

          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-red-400 transition-all"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    forecast.bearishProbability
                  )
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-[10px] uppercase tracking-wide text-gray-500">
          Confidence
        </span>

        <span className="text-xs font-semibold text-white">
          {Math.round(
            forecast.confidence
          )}
          %
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PredictiveAI() {
  const {
    predictiveAI,
    predictiveAILoading,
  } = useMarket();

 const availableSymbols = useMemo(() => {
  if (!predictiveAI?.length) {
    return [];
  }

  return Array.from(
    new Set(
      predictiveAI
        .map(
          (item: any) =>
            item.symbol?.toUpperCase()
        )
        .filter(Boolean)
    )
  ).sort();
}, [predictiveAI]);

  const defaultSymbol =
    useMemo(() => {
      if (
        availableSymbols.includes(
          "BTC"
        )
      ) {
        return "BTC";
      }

      if (
        availableSymbols.includes(
          "ETH"
        )
      ) {
        return "ETH";
      }

      if (
        availableSymbols.includes(
          "SOL"
        )
      ) {
        return "SOL";
      }

      return (
        availableSymbols[0] ?? ""
      );
    }, [
      availableSymbols,
    ]);

  const [
    selectedSymbol,
    setSelectedSymbol,
  ] = useState("");

  const activeSymbol =
    selectedSymbol &&
    availableSymbols.includes(
      selectedSymbol
    )
      ? selectedSymbol
      : defaultSymbol;

  const forecastData =
    predictiveAI?.find(
      (item: any) =>
        item.symbol
          .toUpperCase() ===
        activeSymbol.toUpperCase()
    ) ?? null;

  /* =======================================================
     LOADING
  ======================================================= */

  if (predictiveAILoading) {
    return (
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Predictive AI
            </h3>

            <p className="mt-1 text-xs text-gray-400">
              Forward market scenario modeling
            </p>
          </div>

          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            PREMIUM
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
          <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />

          <p className="text-sm text-gray-300">
            Building predictive scenarios...
          </p>

          <p className="mt-2 text-xs text-gray-600">
            The engine is combining historical
            momentum, Alpha Signals, market regime,
            breadth, relative strength and
            persistence.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     NO DATA
  ======================================================= */

  if (
    !predictiveAI?.length ||
    !forecastData
  ) {
    return (
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Predictive AI
            </h3>

            <p className="mt-1 text-xs text-gray-400">
              Forward market scenario modeling
            </p>
          </div>

          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            PREMIUM
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
          <p className="text-sm text-gray-400">
            Waiting for sufficient market history...
          </p>

          <p className="mt-2 text-xs text-gray-600">
            Predictive AI requires historical
            market observations before generating
            forward scenarios.
          </p>
        </div>
      </div>
    );
  }

  const {
    forecasts,
    overallDirection,
    overallConfidence,
    generatedAt,
  } = forecastData;

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">
              Predictive AI
            </h3>

            <span className="rounded-full border border-cyan-500/10 bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-300">
              PREMIUM
            </span>
          </div>

          <p className="mt-1 text-xs text-gray-400">
            Forward market scenario modeling
          </p>
        </div>

       {availableSymbols.length > 0 && (
  <CoinSelector
    symbols={availableSymbols}
    value={activeSymbol}
    onChange={setSelectedSymbol}
  />
)}
      </div>

      <div
        className={`
          mb-5 rounded-xl
          border p-4
          ${getDirectionBackground(
            overallDirection
          )}
        `}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
              Overall Forecast
            </p>

            <div className="mt-2 flex items-center gap-3">
              <div
                className={`
                  h-3 w-3 rounded-full
                  ${getDirectionDot(
                    overallDirection
                  )}
                `}
              />

              <span
                className={`
                  text-xl font-semibold
                  ${getDirectionClass(
                    overallDirection
                  )}
                `}
              >
                {overallDirection}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              Confidence
            </p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {Math.round(
                overallConfidence
              )}
              %
            </p>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-gray-500">
          Weighted across 15–30M, 1H and 4H
          forecast horizons.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {forecasts.map(
          (forecast: PredictiveForecast) => (
            <ForecastCard
              key={forecast.horizon}
              forecast={forecast}
            />
          )
        )}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-cyan-300/70">
            Key Drivers
          </p>

          <p className="mt-1 text-sm font-medium text-white">
            What is influencing the forecast
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {Array.from(
            new Set(
              forecasts.flatMap(
                (forecast: PredictiveForecast) =>
                  forecast.drivers
              )
            )
          )
            .slice(0, 6)
            .map(
              (
                driver,
                index
              ) => (
                <div
                  key={`${driver}-${index}`}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />

                  <p className="text-xs text-gray-400">
                    {driver}
                  </p>
                </div>
              )
            )}

          {!forecasts.some(
            (
              forecast: PredictiveForecast
            ) =>
              forecast.drivers.length
          ) && (
            <p className="text-xs text-gray-500">
              No dominant drivers identified.
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-yellow-500/10 bg-yellow-500/[0.02] p-4">
        <p className="text-[10px] uppercase tracking-[0.15em] text-yellow-300/70">
          Risk Context
        </p>

        <div className="mt-3 space-y-2">
          {forecasts.map(
            (forecast: PredictiveForecast) => (
              <div
                key={`risk-${forecast.horizon}`}
                className="flex items-start justify-between gap-4"
              >
                <span className="w-14 shrink-0 text-[10px] font-medium text-gray-500">
                  {forecast.horizon}
                </span>

                <p className="text-[11px] text-gray-500">
                  {forecast.risk}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      <details className="group mt-5 border-t border-white/10 pt-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-xs text-gray-400 transition-colors hover:text-gray-200">
          <span>
            ? How Predictive AI Works
          </span>

          <span className="text-gray-600 transition-transform group-open:rotate-180">
            ↓
          </span>
        </summary>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-white">
                Historical market observations
              </p>

              <p className="mt-1 text-[11px] text-gray-500">
                Recent price behaviour is compared
                across multiple historical horizons
                to measure momentum and acceleration.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                Multi-factor market context
              </p>

              <p className="mt-1 text-[11px] text-gray-500">
                The model combines Alpha Signals,
                relative strength, sector strength,
                breadth, persistence and market regime.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                Multi-horizon forecasting
              </p>

              <p className="mt-1 text-[11px] text-gray-500">
                Separate scenarios are generated for
                15–30 minutes, 1 hour and 4 hours.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                Probability mapping
              </p>

              <p className="mt-1 text-[11px] text-gray-500">
                Directional scores are converted into
                conservative bullish, neutral and bearish
                probability estimates.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                Confidence assessment
              </p>

              <p className="mt-1 text-[11px] text-gray-500">
                Confidence measures the quality and
                consistency of supporting evidence. It
                is separate from directional probability.
              </p>
            </div>
          </div>

          <p className="mt-5 border-t border-white/10 pt-4 text-[10px] text-gray-600">
            Predictive AI provides probabilistic market
            scenarios based on available observations.
            It does not guarantee future price movement.
          </p>
        </div>
      </details>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <p className="text-[10px] text-gray-600">
          Generated{" "}
          {new Date(
            generatedAt
          ).toLocaleTimeString()}
        </p>

        <p className="text-[10px] text-gray-600">
          Experimental Predictive Engine
        </p>
      </div>
    </div>
  );
}