"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  ChevronDown,
  Droplets,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type LiquidityZone = {
  low: number;
  high: number;
  liquidity: number;
  levels: number;
  strength: "Strong" | "Moderate" | "Light";
  distancePercent: number;
};

type LiquidityAsset = {
  symbol: string;
  baseAsset: string;

  bestBid: number;
  bestAsk: number;
  mid: number;

  spread: number;
  spreadPercent: number;

  buyLiquidity: number;
  sellLiquidity: number;
  totalLiquidity: number;

  imbalance: number;

  pressure:
    | "BUY-SIDE DOMINANT"
    | "SELL-SIDE DOMINANT"
    | "BALANCED";

  confidence: number;

  buyLiquidityPercent: number;
  sellLiquidityPercent: number;

  strongestBuyZone: LiquidityZone | null;
  strongestSellZone: LiquidityZone | null;

  bidLevels: number;
  askLevels: number;

  timestamp: number;
};

type LiquidityResponse = {
  assets?: LiquidityAsset[];
};

/* =========================================================
   HELPERS
========================================================= */

function safeNumber(
  value: number | undefined | null
) {
  return Number.isFinite(value)
    ? Number(value)
    : 0;
}

function clamp(
  value: number,
  min = 0,
  max = 100
) {
  return Math.min(
    max,
    Math.max(
      min,
      safeNumber(value)
    )
  );
}

function formatUsd(value: number) {
  const safe = safeNumber(value);
  const abs = Math.abs(safe);

  if (abs >= 1_000_000_000) {
    return `$${(
      safe / 1_000_000_000
    ).toFixed(2)}B`;
  }

  if (abs >= 1_000_000) {
    return `$${(
      safe / 1_000_000
    ).toFixed(2)}M`;
  }

  if (abs >= 1_000) {
    return `$${(
      safe / 1_000
    ).toFixed(1)}K`;
  }

  return `$${safe.toFixed(2)}`;
}

function formatPrice(value: number) {
  const safe = safeNumber(value);

  if (!safe) {
    return "--";
  }

  if (safe >= 1000) {
    return safe.toFixed(2);
  }

  if (safe >= 1) {
    return safe.toFixed(3);
  }

  return safe.toFixed(5);
}

function formatRange(
  low: number,
  high: number
) {
  return `${formatPrice(low)} – ${formatPrice(high)}`;
}

function formatTime(timestamp: number) {
  if (!timestamp) {
    return "--";
  }

  try {
    return new Date(
      timestamp
    ).toLocaleTimeString(
      undefined,
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );
  } catch {
    return "--";
  }
}

/* =========================================================
   PRESSURE BADGE
========================================================= */

function PressureBadge({
  pressure,
}: {
  pressure: LiquidityAsset["pressure"];
}) {
  if (
    pressure ===
    "BUY-SIDE DOMINANT"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-medium uppercase tracking-wide text-emerald-300">
        <ArrowUpRight size={11} />
        Buy
      </span>
    );
  }

  if (
    pressure ===
    "SELL-SIDE DOMINANT"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-red-400/20 bg-red-400/10 px-2 py-1 text-[9px] font-medium uppercase tracking-wide text-red-300">
        <ArrowDownRight size={11} />
        Sell
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-medium uppercase tracking-wide text-white/45">
      Balanced
    </span>
  );
}

/* =========================================================
   IMBALANCE CELL
========================================================= */

function ImbalanceCell({
  asset,
}: {
  asset: LiquidityAsset;
}) {
  const imbalance =
    safeNumber(
      asset.imbalance
    );

  const positive =
    imbalance > 0;

  const negative =
    imbalance < 0;

  const buyPercent =
    clamp(
      asset.buyLiquidityPercent
    );

  const sellPercent =
    clamp(
      asset.sellLiquidityPercent
    );

  return (
    <div className="min-w-[95px]">

      <div
        className={`text-xs font-medium ${
          positive
            ? "text-emerald-300"
            : negative
            ? "text-red-300"
            : "text-white/50"
        }`}
      >
        {positive ? "+" : ""}
        {imbalance.toFixed(1)}%
      </div>

      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div className="flex h-full w-full">

          <div
            className="bg-emerald-400/70 transition-[width] duration-300"
            style={{
              width: `${buyPercent}%`,
            }}
          />

          <div
            className="bg-red-400/70 transition-[width] duration-300"
            style={{
              width: `${sellPercent}%`,
            }}
          />

        </div>
      </div>

    </div>
  );
}

/* =========================================================
   ZONE CELL
========================================================= */

function ZoneCell({
  zone,
  type,
}: {
  zone: LiquidityZone | null;
  type: "buy" | "sell";
}) {
  if (!zone) {
    return (
      <div className="text-[10px] text-white/25">
        No significant zone
      </div>
    );
  }

  return (
    <div className="min-w-[155px]">

      <div
        className={`text-[10px] font-medium ${
          type === "buy"
            ? "text-emerald-300/80"
            : "text-red-300/80"
        }`}
      >
        {formatRange(
          zone.low,
          zone.high
        )}
      </div>

      <div className="mt-1 flex items-center gap-2 text-[9px] text-white/30">

        <span>
          {formatUsd(
            zone.liquidity
          )}
        </span>

        <span className="text-white/15">
          •
        </span>

        <span>
          {zone.distancePercent.toFixed(
            2
          )}
          %
        </span>

        <span className="text-white/15">
          •
        </span>

        <span
          className={
            zone.strength ===
            "Strong"
              ? type === "buy"
                ? "text-emerald-300/70"
                : "text-red-300/70"
              : "text-white/35"
          }
        >
          {zone.strength}
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   LIVE INDICATOR
========================================================= */

function LiveIndicator({
  refreshing,
}: {
  refreshing: boolean;
}) {
  return (
    <div className="flex items-center gap-2">

      <span className="relative flex h-2 w-2">

        <span
          className={`absolute inline-flex h-full w-full rounded-full ${
            refreshing
              ? "animate-ping bg-cyan-400/50"
              : "bg-emerald-400/40"
          }`}
        />

        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            refreshing
              ? "bg-cyan-300"
              : "bg-emerald-400"
          }`}
        />

      </span>

      <span
        className={`text-[9px] uppercase tracking-wider ${
          refreshing
            ? "text-cyan-300/70"
            : "text-emerald-300/60"
        }`}
      >
        {refreshing
          ? "Updating"
          : "Live"}
      </span>

    </div>
  );
}

/* =========================================================
   HOW LIQUIDITY HEAT WORKS
========================================================= */

function HowLiquidityHeatWorks() {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">

      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) => !value
          )
        }
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
              How Liquidity Heat Works
            </span>

          </div>

          <div className="mt-1 text-[10px] text-white/30">
            Understand how observable order-book liquidity
            is converted into pressure zones.
          </div>

        </div>

        <ChevronDown
          size={15}
          className={`shrink-0 text-white/30 transition-transform ${
            open
              ? "rotate-180"
              : ""
          }`}
        />

      </button>

      {open && (
        <div className="border-t border-white/5 p-4">

          <div className="grid gap-3 md:grid-cols-2">

            <div className="rounded-lg border border-white/5 bg-black/10 p-4">

              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/70">
                Order-book depth
              </div>

              <div className="mt-2 text-xs font-medium text-white/75">
                Live bids and asks are observed around the market price.
              </div>

              <div className="mt-1 text-[10px] leading-relaxed text-white/35">
                The system uses observable exchange order-book
                levels to measure where executable liquidity is
                currently concentrated.
              </div>

            </div>

            <div className="rounded-lg border border-white/5 bg-black/10 p-4">

              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/70">
                Liquidity concentration
              </div>

              <div className="mt-2 text-xs font-medium text-white/75">
                Nearby orders are grouped into price zones.
              </div>

              <div className="mt-1 text-[10px] leading-relaxed text-white/35">
                Larger concentrations of order-book liquidity
                create stronger zones than isolated small orders.
              </div>

            </div>

            <div className="rounded-lg border border-white/5 bg-black/10 p-4">

              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/70">
                Buy vs. sell pressure
              </div>

              <div className="mt-2 text-xs font-medium text-white/75">
                Bid-side and ask-side liquidity are compared.
              </div>

              <div className="mt-1 text-[10px] leading-relaxed text-white/35">
                When observable bid liquidity outweighs ask liquidity,
                the current book has a buy-side skew. The opposite
                produces a sell-side skew.
              </div>

            </div>

            <div className="rounded-lg border border-white/5 bg-black/10 p-4">

              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/70">
                Zone strength
              </div>

              <div className="mt-2 text-xs font-medium text-white/75">
                Stronger concentrations receive higher heat.
              </div>

              <div className="mt-1 text-[10px] leading-relaxed text-white/35">
                Zone strength is relative to the other observable
                liquidity concentrations in the current order book.
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
                What this signal does NOT tell you
              </div>

              <div className="mt-1 text-[10px] leading-relaxed text-white/40">
                A liquidity zone is not guaranteed support or resistance.
                Orders can be added, cancelled, moved or executed quickly.
                Large displayed orders can also disappear before price reaches
                them.
              </div>

            </div>

          </div>

          <div className="mt-4 text-[9px] leading-relaxed text-white/25">
            Liquidity Heat provides a real-time analytical view of
            observable exchange order-book liquidity. It does not
            guarantee future price movement, support, resistance or
            execution outcomes.
          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   LOADING STATE
========================================================= */

function LoadingState() {
  return (
    <div className="space-y-4">

      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">

        <div className="space-y-3">

          <div className="h-3 w-32 animate-pulse rounded bg-white/10" />

          <div className="h-7 w-64 animate-pulse rounded bg-white/10" />

          <div className="h-3 w-96 max-w-full animate-pulse rounded bg-white/5" />

        </div>

      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">

        <div className="h-12 border-b border-white/5 bg-white/[0.025]" />

        <div className="divide-y divide-white/5">

          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-6 gap-4 px-4 py-5"
            >

              {Array.from({
                length: 6,
              }).map(
                (_, cell) => (
                  <div
                    key={cell}
                    className="h-4 animate-pulse rounded bg-white/5"
                  />
                )
              )}

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function LiquidityHeat() {
  const [assets, setAssets] =
    useState<LiquidityAsset[]>([]);

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const mountedRef =
    useRef(true);

  const requestRef =
    useRef<AbortController | null>(null);

  const refreshTimeoutRef =
    useRef<NodeJS.Timeout | null>(
      null
    );

  /* =======================================================
     LOAD LIQUIDITY
  ======================================================= */

  const loadLiquidity =
    useCallback(
      async (
        isManualRefresh = false
      ) => {

        /*
         * Cancel the previous request if one
         * is still running.
         */
        requestRef.current?.abort();

        const controller =
          new AbortController();

        requestRef.current =
          controller;

        try {

          /*
           * IMPORTANT:
           * We only show the refreshing state
           * after the initial screen is already
           * rendered.
           */
          if (
            isManualRefresh &&
            mountedRef.current
          ) {
            setRefreshing(true);
          }

          const response =
            await fetch(
              "/api/intel/liquidity",
              {
                cache: "no-store",
                signal:
                  controller.signal,
              }
            );

          if (!response.ok) {
            throw new Error(
              `Liquidity data request failed: ${response.status}`
            );
          }

          const data =
            (await response.json()) as LiquidityResponse;

          const nextAssets =
            Array.isArray(
              data.assets
            )
              ? data.assets
              : [];

          if (
            !mountedRef.current
          ) {
            return;
          }

          /*
           * IMPORTANT:
           * Update the data directly.
           *
           * We DO NOT set loading=true here.
           * Therefore the table remains mounted.
           */
          setAssets(
            nextAssets
          );

          setError(null);

        } catch (err) {

          /*
           * Ignore cancelled requests.
           */
          if (
            err instanceof
              DOMException &&
            err.name ===
              "AbortError"
          ) {
            return;
          }

          if (
            !mountedRef.current
          ) {
            return;
          }

          console.error(
            "Liquidity Heat fetch error:",
            err
          );

          /*
           * During background refresh,
           * keep the existing table visible.
           *
           * Only show the error if there is
           * no existing data.
           */
          if (
            assets.length === 0
          ) {
            setError(
              err instanceof Error
                ? err.message
                : "Unable to load liquidity data."
            );
          }

        } finally {

          if (
            !mountedRef.current
          ) {
            return;
          }

          setInitialLoading(
            false
          );

          setRefreshing(
            false
          );

        }
      },
      [assets.length]
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    mountedRef.current =
      true;

    loadLiquidity();

    return () => {

      mountedRef.current =
        false;

      requestRef.current?.abort();

      if (
        refreshTimeoutRef.current
      ) {
        clearTimeout(
          refreshTimeoutRef.current
        );
      }

    };

  }, [loadLiquidity]);

  /* =======================================================
     AUTO REFRESH
  ======================================================= */

  useEffect(() => {

    const interval =
      setInterval(
        () => {
          loadLiquidity(
            false
          );
        },
        3000
      );

    return () =>
      clearInterval(
        interval
      );

  }, [loadLiquidity]);

  /* =======================================================
     MANUAL REFRESH
  ======================================================= */

  function handleManualRefresh() {
    if (refreshing) {
      return;
    }

    loadLiquidity(
      true
    );
  }

  /* =======================================================
     INITIAL LOADING ONLY
  ======================================================= */

  if (
    initialLoading &&
    assets.length === 0
  ) {
    return (
      <LoadingState />
    );
  }

  /* =======================================================
     ERROR WITH NO DATA
  ======================================================= */

  if (
    error &&
    assets.length === 0
  ) {
    return (
      <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6">

        <div className="flex items-center gap-2 text-red-300">

          <ShieldAlert
            size={17}
          />

          <span className="text-sm font-medium">
            Liquidity Heat unavailable
          </span>

        </div>

        <div className="mt-2 text-xs text-white/40">
          {error}
        </div>

        <button
          type="button"
          onClick={
            handleManualRefresh
          }
          disabled={
            refreshing
          }
          className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-40"
        >

          <RefreshCcw
            size={12}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Retrying..."
            : "Retry"}

        </button>

      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="space-y-4">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <Droplets
              size={15}
              className="text-cyan-300"
            />

            <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">
              Premium Intelligence
            </div>

          </div>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Liquidity Heat
          </h2>

          <p className="mt-1 max-w-2xl text-xs text-white/40">
            Real-time observable order-book liquidity
            across major crypto assets.
          </p>

        </div>

        <div className="flex items-center gap-3">

          <LiveIndicator
            refreshing={
              refreshing
            }
          />

          <button
            type="button"
            onClick={
              handleManualRefresh
            }
            disabled={
              refreshing
            }
            aria-label="Refresh liquidity data"
            className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >

            <RefreshCcw
              size={13}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            <span className="hidden sm:inline">
              {refreshing
                ? "Updating..."
                : "Refresh"}
            </span>

          </button>

        </div>

      </div>

      {/* =================================================
          MARKET SCANNER
      ================================================= */}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">

        {/* =================================================
            TABLE HEADER
        ================================================= */}

        <div className="border-b border-white/10 bg-white/[0.025] px-4 py-3">

          <div className="flex items-center justify-between gap-4">

            <div>

              <div className="flex items-center gap-2">

                <Activity
                  size={14}
                  className="text-cyan-300/70"
                />

                <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Major Market Liquidity
                </span>

              </div>

              <div className="mt-1 text-xs text-white/60">
                Top{" "}
                {assets.length ||
                  0}{" "}
                assets by market importance
              </div>

            </div>

            <div className="hidden text-right sm:block">

              <div className="text-[9px] uppercase tracking-wider text-white/25">
                Live depth
              </div>

              <div className="mt-1 flex items-center justify-end gap-2 text-[10px] text-emerald-300/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                3s refresh
              </div>

            </div>

          </div>

        </div>

      {/* =================================================
    DESKTOP TABLE
================================================= */}

<div className="hidden overflow-x-auto md:block">

  <table className="w-full min-w-[1180px] border-collapse">

    <thead>
      <tr className="border-b border-white/5 text-left">

        {/* FROZEN ASSET HEADER */}

        <th
          className="
            sticky
            left-0
            z-30
            w-[170px]
            min-w-[170px]
            border-r
            border-white/10
            bg-[#0b0b0f]
            px-4
            py-3
            text-[9px]
            font-medium
            uppercase
            tracking-[0.15em]
            text-white/25
          "
        >
          Asset
        </th>

        <th className="px-4 py-3 text-right text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
          Price
        </th>

        <th className="px-4 py-3 text-right text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
          Buy Depth
        </th>

        <th className="px-4 py-3 text-right text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
          Sell Depth
        </th>

        <th className="px-4 py-3 text-left text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
          Imbalance
        </th>

        <th className="px-4 py-3 text-left text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
          Pressure
        </th>

        <th className="px-4 py-3 text-left text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
          Buy Zone
        </th>

        <th className="px-4 py-3 text-left text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
          Sell Zone
        </th>

        <th className="px-4 py-3 text-right text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
          Confidence
        </th>

      </tr>
    </thead>

    <tbody className="divide-y divide-white/5">

      {assets.map((asset) => (

        <tr
          key={asset.symbol}
          className="group transition hover:bg-white/[0.025]"
        >

          {/* =================================================
              FROZEN ASSET COLUMN
          ================================================= */}

          <td
            className="
              sticky
              left-0
              z-20
              w-[170px]
              min-w-[170px]
              border-r
              border-white/10
              bg-[#0b0b0f]
              px-4
              py-4
              shadow-[6px_0_10px_-8px_rgba(255,255,255,0.18)]
              transition-colors
              group-hover:bg-[#101014]
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/10
                  bg-white/5
                  text-[10px]
                  font-semibold
                  text-white/70
                "
              >
                {asset.baseAsset
                  ?.slice(0, 4)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">

                <div className="truncate text-xs font-semibold text-white/85">
                  {asset.baseAsset}
                </div>

                <div className="mt-0.5 truncate text-[9px] text-white/25">
                  {asset.symbol}
                </div>

              </div>

            </div>

          </td>

          {/* =================================================
              PRICE
          ================================================= */}

          <td className="px-4 py-4 text-right">

            <div className="text-xs font-medium text-white/80">
              {formatPrice(asset.mid)}
            </div>

            <div className="mt-1 text-[9px] text-white/25">
              Spread {formatPrice(asset.spread)}
            </div>

          </td>

          {/* =================================================
              BUY DEPTH
          ================================================= */}

          <td className="px-4 py-4 text-right">

            <div className="text-xs font-medium text-emerald-300">
              {formatUsd(asset.buyLiquidity)}
            </div>

            <div className="mt-1 text-[9px] text-white/25">
              {safeNumber(
                asset.buyLiquidityPercent
              ).toFixed(1)}
              %
            </div>

          </td>

          {/* =================================================
              SELL DEPTH
          ================================================= */}

          <td className="px-4 py-4 text-right">

            <div className="text-xs font-medium text-red-300">
              {formatUsd(asset.sellLiquidity)}
            </div>

            <div className="mt-1 text-[9px] text-white/25">
              {safeNumber(
                asset.sellLiquidityPercent
              ).toFixed(1)}
              %
            </div>

          </td>

          {/* =================================================
              IMBALANCE
          ================================================= */}

          <td className="px-4 py-4">

            <ImbalanceCell
              asset={asset}
            />

          </td>

          {/* =================================================
              PRESSURE
          ================================================= */}

          <td className="px-4 py-4">

            <PressureBadge
              pressure={asset.pressure}
            />

          </td>

          {/* =================================================
              BUY ZONE
          ================================================= */}

          <td className="px-4 py-4">

            <ZoneCell
              zone={asset.strongestBuyZone}
              type="buy"
            />

          </td>

          {/* =================================================
              SELL ZONE
          ================================================= */}

          <td className="px-4 py-4">

            <ZoneCell
              zone={asset.strongestSellZone}
              type="sell"
            />

          </td>

          {/* =================================================
              CONFIDENCE
          ================================================= */}

          <td className="px-4 py-4 text-right">

            <div className="text-xs font-medium text-white/65">
              {safeNumber(
                asset.confidence
              ).toFixed(0)}
              %
            </div>

            <div className="mt-1 text-[9px] text-white/20">
              {asset.bidLevels +
                asset.askLevels}{" "}
              levels
            </div>

          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

        {/* =================================================
            MOBILE TABLE
        ================================================= */}

        <div className="md:hidden">

          <div className="divide-y divide-white/5">

            {assets.map(
              (asset) => (
                <div
                  key={
                    asset.symbol
                  }
                  className="p-4 transition-colors hover:bg-white/[0.02]"
                >

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[9px] font-semibold text-white/70">
                        {asset.baseAsset
                          ?.slice(
                            0,
                            4
                          )
                          .toUpperCase()}
                      </div>

                      <div>

                        <div className="text-xs font-semibold text-white/85">
                          {
                            asset.baseAsset
                          }
                        </div>

                        <div className="text-[9px] text-white/25">
                          {
                            asset.symbol
                          }
                        </div>

                      </div>

                    </div>

                    <PressureBadge
                      pressure={
                        asset.pressure
                      }
                    />

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">

                    <div>

                      <div className="text-[9px] uppercase tracking-wider text-white/25">
                        Price
                      </div>

                      <div className="mt-1 text-xs font-medium tabular-nums text-white/75">
                        {formatPrice(
                          asset.mid
                        )}
                      </div>

                    </div>

                    <div>

                      <div className="text-[9px] uppercase tracking-wider text-white/25">
                        Imbalance
                      </div>

                      <div className="mt-1">
                        <ImbalanceCell
                          asset={
                            asset
                          }
                        />
                      </div>

                    </div>

                    <div>

                      <div className="text-[9px] uppercase tracking-wider text-white/25">
                        Buy Depth
                      </div>

                      <div className="mt-1 text-xs font-medium tabular-nums text-emerald-300">
                        {formatUsd(
                          asset.buyLiquidity
                        )}
                      </div>

                    </div>

                    <div>

                      <div className="text-[9px] uppercase tracking-wider text-white/25">
                        Sell Depth
                      </div>

                      <div className="mt-1 text-xs font-medium tabular-nums text-red-300">
                        {formatUsd(
                          asset.sellLiquidity
                        )}
                      </div>

                    </div>

                    <div>

                      <div className="text-[9px] uppercase tracking-wider text-white/25">
                        Buy Zone
                      </div>

                      <div className="mt-1">
                        <ZoneCell
                          zone={
                            asset.strongestBuyZone
                          }
                          type="buy"
                        />
                      </div>

                    </div>

                    <div>

                      <div className="text-[9px] uppercase tracking-wider text-white/25">
                        Sell Zone
                      </div>

                      <div className="mt-1">
                        <ZoneCell
                          zone={
                            asset.strongestSellZone
                          }
                          type="sell"
                        />
                      </div>

                    </div>

                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[9px] text-white/25">

                    <span>
                      Confidence{" "}
                      {safeNumber(
                        asset.confidence
                      ).toFixed(
                        0
                      )}
                      %
                    </span>

                    <span>
                      {safeNumber(
                        asset.bidLevels
                      ) +
                        safeNumber(
                          asset.askLevels
                        )}{" "}
                      observable levels
                    </span>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {!assets.length && (
          <div className="px-5 py-12 text-center">

            <Droplets
              size={22}
              className="mx-auto text-white/20"
            />

            <div className="mt-3 text-xs text-white/45">
              No liquidity data available.
            </div>

            <div className="mt-1 text-[10px] text-white/25">
              Try refreshing the market intelligence feed.
            </div>

          </div>
        )}

        {/* =================================================
            TABLE FOOTER
        ================================================= */}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 px-4 py-3">

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-white/25">

            <span>
              Source: Binance order book
            </span>

            <span>
              {assets.length}{" "}
              assets
            </span>

            <span>
              Live depth
            </span>

          </div>

          {assets[0]
            ?.timestamp && (
            <div className="text-[9px] tabular-nums text-white/20">
              Updated{" "}
              {formatTime(
                assets[0]
                  .timestamp
              )}
            </div>
          )}

        </div>

      </div>

      {/* =================================================
          BACKGROUND ERROR
      ================================================= */}

      {error &&
        assets.length >
          0 && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-400/10 bg-amber-400/[0.025] px-3 py-2 text-[9px] text-amber-200/50">

            <ShieldAlert
              size={12}
              className="shrink-0 text-amber-300/50"
            />

            <span>
              Latest liquidity update
              temporarily unavailable.
              Showing the most recent
              observable data.
            </span>

          </div>
        )}

      {/* =================================================
          EVIDENCE NOTICE
      ================================================= */}

      <div className="flex gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.035] p-4">

        <ShieldAlert
          size={16}
          className="mt-0.5 shrink-0 text-amber-300/70"
        />

        <div>

          <div className="text-xs font-medium text-amber-200/80">
            Observable liquidity only
          </div>

          <div className="mt-1 text-[10px] leading-relaxed text-white/35">
            Order-book liquidity can change rapidly. Orders may be
            cancelled, moved or executed before price reaches a
            displayed zone. A large displayed order does not guarantee
            that the liquidity will remain available.
          </div>

        </div>

      </div>

      {/* =================================================
          HOW IT WORKS
      ================================================= */}

      <HowLiquidityHeatWorks />

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/5 pt-3 text-[9px] text-white/25">

        <span>
          Liquidity Heat • Premium Intelligence
        </span>

        <span>
          Observable exchange depth
        </span>

        <span>
          Refresh: 3s
        </span>

      </div>

    </div>
  );
}