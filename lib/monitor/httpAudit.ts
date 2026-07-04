// lib/monitor/httpAudit.ts

type AuditMeta = {
  url: string;
  method?: string;
  caller?: string;
};

function identifyProvider(url: string) {
  if (url.includes("binance")) return "BINANCE";
  if (url.includes("coingecko")) return "COINGECKO";
  return "EXTERNAL";
}

function getCaller() {
  const err = new Error();
  const stack = err.stack?.split("\n") || [];

  // skip first few internal frames
  const relevant = stack.find(line =>
    line.includes("MarketEngine") ||
    line.includes("marketStore") ||
    line.includes("route") ||
    line.includes("binanceClient") ||
    line.includes("coinGeckoClient")
  );

  return relevant?.trim() || "unknown";
}

export function initHttpAudit() {
  if (typeof globalThis === "undefined") return;

  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input: any, init?: any) => {
    const url = typeof input === "string" ? input : input?.url || "";

    const provider = identifyProvider(url);
    const caller = getCaller();

    const start = performance.now();

    try {
      const res = await originalFetch(input, init);

      const duration = Math.round(performance.now() - start);

      console.log(
        `[HTTP AUDIT] ${provider} | ${url} | ${caller} | ${res.status} | ${duration}ms`
      );

      return res;
    } catch (err) {
      console.log(
        `[HTTP AUDIT ERROR] ${provider} | ${url} | ${caller}`
      );
      throw err;
    }
  };
}