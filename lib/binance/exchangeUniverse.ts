let cachedSymbols: Set<string> | null = null;

export async function getExchangeUniverse() {
  if (cachedSymbols) return cachedSymbols;

  const res = await fetch(
    "https://api.binance.com/api/v3/exchangeInfo"
  );

  if (!res.ok) {
    throw new Error(
      `ExchangeInfo HTTP ${res.status}`
    );
  }

  const data = await res.json();

  if (!data?.symbols || !Array.isArray(data.symbols)) {
    console.error(
      "Invalid exchangeInfo response",
      data
    );

    return new Set();
  }

  const symbols = data.symbols
    .filter(
      (s: any) =>
        s.status === "TRADING" &&
        s.quoteAsset === "USDT"
    )
    .map((s: any) => s.symbol);

  cachedSymbols = new Set(symbols);

  return cachedSymbols;
}