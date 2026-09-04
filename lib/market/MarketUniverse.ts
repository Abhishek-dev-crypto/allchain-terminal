import {
  getExchangeSymbols,
  getMultiplePrices,
  type BinanceSymbolInfo,
} from "./binanceClient";

/* =========================================================
   TYPES
========================================================= */

export type MarketUniverseAsset = {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  quoteVolume24h: number;
  rank: number;
};

export type MarketUniverse = {
  assets: MarketUniverseAsset[];
  generatedAt: string;
};

/* =========================================================
   CONFIG
========================================================= */

/*
 * The universe is intentionally based on liquid assets rather
 * than every listed Binance token.
 *
 * This prevents extremely illiquid markets from distorting
 * market-wide intelligence.
 */
const MAX_ASSETS = 50;

/*
 * Stablecoins should not participate in directional crypto
 * market breadth.
 */
const EXCLUDED_ASSETS = new Set([
  "USDT",
  "USDC",
  "FDUSD",
  "TUSD",
  "USDE",
  "DAI",
  "USDD",
  "PYUSD",
  "USD1",
  "BUSD",
  "USTC",

  // Non-directional / unsuitable for Edge
  "RLUSD",
  "EUR",
  "XAUT",
  "PAXG",
   "U",
]);

/*
 * Leveraged-token suffixes.
 */
const LEVERAGED_SUFFIXES = [
  "UP",
  "DOWN",
  "BULL",
  "BEAR",
];

/* =========================================================
   HELPERS
========================================================= */

function isExcludedAsset(
  baseAsset: string
) {
  const normalized =
    baseAsset.toUpperCase();

  if (
    EXCLUDED_ASSETS.has(normalized)
  ) {
    return true;
  }

  return LEVERAGED_SUFFIXES.some(
    (suffix) =>
      normalized.endsWith(suffix)
  );
}

function isEligibleSymbol(
  info: BinanceSymbolInfo
) {
  if (
    info.status !== "TRADING"
  ) {
    return false;
  }

  if (
    info.quoteAsset !== "USDT"
  ) {
    return false;
  }

  if (
    !info.isSpotTradingAllowed
  ) {
    return false;
  }

  if (
    isExcludedAsset(
      info.baseAsset
    )
  ) {
    return false;
  }

  return true;
}

/* =========================================================
   MARKET UNIVERSE
========================================================= */

export async function getMarketUniverse(): Promise<MarketUniverse> {
  const exchangeSymbols =
    await getExchangeSymbols();

  const eligibleSymbols =
    exchangeSymbols.filter(
      isEligibleSymbol
    );

  if (!eligibleSymbols.length) {
    throw new Error(
      "No eligible Binance market symbols found"
    );
  }

  const symbolNames =
    eligibleSymbols.map(
      (item) => item.symbol
    );

  /*
   * Binance returns the complete 24h ticker set.
   *
   * We use actual quote volume to rank market
   * participation rather than maintaining a hardcoded
   * coin list.
   */
  const tickers =
    await getMultiplePrices(
      symbolNames
    );

  const volumeBySymbol =
    new Map<string, number>();

  for (const ticker of tickers) {
    const quoteVolume =
      Number(
        ticker.quoteVolume
      );

    if (
      Number.isFinite(
        quoteVolume
      ) &&
      quoteVolume > 0
    ) {
      volumeBySymbol.set(
        ticker.symbol,
        quoteVolume
      );
    }
  }

  const assets =
    eligibleSymbols
      .map((info) => ({
        symbol: info.symbol,
        baseAsset: info.baseAsset,
        quoteAsset: info.quoteAsset,
        quoteVolume24h:
          volumeBySymbol.get(
            info.symbol
          ) ?? 0,
      }))
      .filter(
        (asset) =>
          asset.quoteVolume24h > 0
      )
      .sort(
        (a, b) =>
          b.quoteVolume24h -
          a.quoteVolume24h
      )
      .slice(
        0,
        MAX_ASSETS
      )
      .map(
        (asset, index) => ({
          ...asset,
          rank: index + 1,
        })
      );

  if (!assets.length) {
    throw new Error(
      "No liquid market assets found"
    );
  }

  return {
    assets,
    generatedAt:
      new Date().toISOString(),
  };
}