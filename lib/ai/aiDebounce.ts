const lastRun: Record<string, number> = {};

const MIN_INTERVAL = 5000; // 5 sec

export function shouldRunAI(symbol: string) {
  const now = Date.now();
  const last = lastRun[symbol] || 0;

  if (now - last < MIN_INTERVAL) return false;

  lastRun[symbol] = now;
  return true;
}