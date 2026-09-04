import type { MarketContext } from "./marketContext";

type CacheType =
  | "ticker"
  | "candles"
  | "snapshot";

/* =========================================================
   LIMITS
========================================================= */

const MIN_TTL = 5;
const MAX_TTL = 600;

/* =========================================================
   HELPERS
========================================================= */

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

/* =========================================================
   BASE TTL
========================================================= */

function getBaseTTL(
  type: CacheType,
  timeframe?: string
): number {

  switch (type) {
    case "ticker":
      return 10;

    case "snapshot":
      return 15;

    case "candles":
      switch (timeframe) {
        case "1m":
          return 10;

        case "5m":
          return 15;

        case "15m":
          return 30;

        case "30m":
          return 45;

        case "1h":
          return 60;

        case "4h":
          return 180;

        case "1d":
          return 600;

        default:
          return 30;
      }

    default:
      return 30;
  }
}

/* =========================================================
   ADAPTIVE TTL
========================================================= */

export function getAdaptiveTTL(
  type: CacheType,
  ctx: MarketContext
): number {

  const {
    volatility,
    momentum,
    regime,
    timeframe,
  } = ctx;

  let ttl = getBaseTTL(
    type,
    timeframe
  );

  /* -------------------------------------------------------
     VOLATILITY

     Higher volatility → refresh sooner.
     Lower volatility → cache longer.
  ------------------------------------------------------- */

  if (volatility >= 8) {
    ttl *= 0.60;
  } else if (volatility >= 6) {
    ttl *= 0.75;
  } else if (volatility < 1) {
    ttl *= 1.50;
  } else if (volatility < 2) {
    ttl *= 1.25;
  }

  /* -------------------------------------------------------
     MOMENTUM

     Strong directional movement deserves
     somewhat faster refreshes.
  ------------------------------------------------------- */

  const absoluteMomentum =
    Math.abs(momentum);

  if (absoluteMomentum >= 8) {
    ttl *= 0.70;
  } else if (absoluteMomentum >= 5) {
    ttl *= 0.80;
  }

  /* -------------------------------------------------------
     MARKET REGIME
  ------------------------------------------------------- */

  switch (regime) {

    case "BREAKOUT":
      ttl *= 0.70;
      break;

    case "TRENDING":
      ttl *= 0.90;
      break;

    case "RANGING":
      ttl *= 1.25;
      break;
  }

  /* -------------------------------------------------------
     FINAL SAFETY BOUNDS

     Never allow adaptive logic to create
     extremely aggressive upstream polling.
  ------------------------------------------------------- */

  return clamp(
    Math.round(ttl),
    MIN_TTL,
    MAX_TTL
  );
}