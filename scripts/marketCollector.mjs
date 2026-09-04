const INTERVAL = 5 * 60 * 1000;
const URL = "http://localhost:3000/api/intel/heatmap";

async function collect() {
  const started = Date.now();

  try {
    const response = await fetch(URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const coins = await response.json();

    console.log(
      `[Collector] ${new Date().toLocaleString()} | ` +
      `Snapshot received | ${Array.isArray(coins) ? coins.length : 0} coins | ` +
      `${Date.now() - started}ms`
    );
  } catch (error) {
    console.error(
      `[Collector] ${new Date().toLocaleString()} | ERROR:`,
      error
    );
  }
}

console.log("========================================");
console.log(" AllChain Labs Local Market Collector");
console.log(" Interval: 5 minutes");
console.log(` Target: ${URL}`);
console.log("========================================");

await collect();

setInterval(collect, INTERVAL);
