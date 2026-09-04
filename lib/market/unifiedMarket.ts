import { getCoinGeckoId } from "@/lib/coingeckoSymbolMap";
import { cacheOrchestrator } from "./cache/cacheOrchestrator";

type UnifiedMarketData = {
  symbol: string;
  price: number | null;
  change24h: number | null;
  high24h: number | null;
  low24h: number | null;
  volume24h: number | null;
  source: "coingecko";
  timestamp: number;
};

export async function getUnifiedMarket(
  symbol: string
): Promise<UnifiedMarketData> {
  const normalizedSymbol = symbol.toUpperCase();

  const cacheKey = `umdl:${normalizedSymbol}`;

  return cacheOrchestrator<UnifiedMarketData>({
    key: cacheKey,

    /*
     * Unified market data is currently sourced from CoinGecko.
     *
     * We intentionally use the snapshot cache type here because
     * this is a point-in-time market snapshot rather than a
     * candle series.
     */
    type: "snapshot",

    fetcher: async () => {
      const coinId =
        getCoinGeckoId(normalizedSymbol);

      if (!coinId) {
        throw new Error(
          `Unsupported symbol: ${normalizedSymbol}`
        );
      }

      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!res.ok) {
        throw new Error(
          `CoinGecko HTTP ${res.status}`
        );
      }

      const data = await res.json();

      const coin = data?.[coinId];

      if (!coin) {
        throw new Error(
          "Invalid CoinGecko response"
        );
      }

      return {
        symbol: normalizedSymbol,

        price:
          typeof coin.usd === "number"
            ? coin.usd
            : null,

        change24h:
          typeof coin.usd_24h_change === "number"
            ? coin.usd_24h_change
            : null,

        high24h: null,
        low24h: null,
        volume24h: null,

        source: "coingecko",

        timestamp: Date.now(),
      };
    },

    /*
     * Keep the context deterministic here.
     *
     * The adaptive TTL system is primarily driven by
     * candle-derived market context. Unified market data
     * does not currently contain enough information to
     * calculate that context safely.
     */
    getContext: () => ({
      symbol: normalizedSymbol,
      volatility: 3,
      momentum: 0,
      regime: "TRENDING",
      timeframe: undefined,
    }),
  });
}