const COINGECKO_IDS: Record<string, string> = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  SOLUSDT: "solana",
  BNBUSDT: "binancecoin",
  XRPUSDT: "ripple",
  ADAUSDT: "cardano",
  DOGEUSDT: "dogecoin",
  DOTUSDT: "polkadot",
  AVAXUSDT: "avalanche-2",
  MATICUSDT: "polygon-pos",
  LINKUSDT: "chainlink",
  LTCUSDT: "litecoin",
};

export function getCoinGeckoId(symbol: string) {
  return COINGECKO_IDS[symbol];
}

export { COINGECKO_IDS };