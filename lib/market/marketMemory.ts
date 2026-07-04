type SnapshotCache = {
  [symbol: string]: {
    data: any;
    timestamp: number;
  };
};

const memory: SnapshotCache = {};

const TTL = 15 * 1000; // 15 sec

export function getCachedSnapshot(symbol: string) {
  const entry = memory[symbol];

  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > TTL;
  if (isExpired) return null;

  return entry.data;
}

export function setCachedSnapshot(symbol: string, data: any) {
  memory[symbol] = {
    data,
    timestamp: Date.now(),
  };
}