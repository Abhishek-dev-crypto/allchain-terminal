import type { MarketContext } from "./marketContext";

type CacheType = "ticker" | "candles" | "snapshot";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

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

  // -----------------------
  // Base TTL
  // -----------------------

  let ttl = 10;

  if (type === "ticker") {
    ttl = 6;
  }

  if (type === "snapshot") {
    ttl = 8;
  }

  if (type === "candles") {
    switch (timeframe) {
      case "1m":
        ttl = 5;
        break;

      case "5m":
        ttl = 10;
        break;

      case "15m":
        ttl = 20;
        break;

      case "30m":
        ttl = 30;
        break;

      case "1h":
        ttl = 60;
        break;

      case "4h":
        ttl = 180;
        break;

      case "1d":
        ttl = 600;
        break;

      default:
        ttl = 30;
    }
  }

  // -----------------------
  // Volatility
  // -----------------------

  if (volatility > 6)
    ttl *= 0.5;

  else if (volatility < 2)
    ttl *= 1.5;

  // -----------------------
  // Momentum
  // -----------------------

  if (Math.abs(momentum) > 5)
    ttl *= 0.7;

  // -----------------------
  // Regime
  // -----------------------

  if (regime === "BREAKOUT")
    ttl *= 0.5;

  if (regime === "RANGING")
    ttl *= 1.5;

  return clamp(
    Math.round(ttl),
    3,
    600
  );
}