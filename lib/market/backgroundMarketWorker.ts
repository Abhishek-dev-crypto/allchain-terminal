import { marketEngine } from "./MarketEngine";

const SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
];

let started = false;

export function startMarketWorker() {
  if (started) return;

  started = true;

  console.log("🚀 Background Market Worker Started");

  async function refresh() {
    console.log("🔄 Refreshing market cache...");

    await Promise.allSettled(
      SYMBOLS.map((symbol) => marketEngine.getSnapshot(symbol))
    );

    console.log("✅ Refresh complete");
  }

  refresh();

  setInterval(refresh, 5000);
}