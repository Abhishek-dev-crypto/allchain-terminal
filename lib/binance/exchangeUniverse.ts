let cachedSymbols: Set<string> | null = null;

export async function getExchangeUniverse() {
  if (cachedSymbols) return cachedSymbols;

  const res = await fetch(
    'https://api.binance.com/api/v3/exchangeInfo'
  );

  const data = await res.json();

  const symbols = data.symbols
    .filter(
      (s: any) =>
        s.status === 'TRADING' &&
        s.quoteAsset === 'USDT'
    )
    .map((s: any) => s.symbol);

  cachedSymbols = new Set(symbols);

  return cachedSymbols;
}