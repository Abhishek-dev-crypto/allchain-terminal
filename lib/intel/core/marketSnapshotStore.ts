import type { Coin } from "@/lib/types/coin";

type Snapshot = {
  coins: Coin[];
  timestamp: number;
};

let cachedSnapshot: Snapshot | null = null;
let lastFetchTime = 0;
let inFlightPromise: Promise<Snapshot> | null = null;

const CACHE_TTL = 60 * 1000; // 60 seconds
const REQUEST_TIMEOUT = 12000; // 12 seconds

/* ----------------------------- */
/* INTERNAL FETCH                */
/* ----------------------------- */

async function fetchMarketSnapshot(
  baseUrl?: string
): Promise<Snapshot> {
  const controller = new AbortController();

  let timedOut = false;

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const url = baseUrl
      ? `${baseUrl}/api/intel/heatmap`
      : "/api/intel/heatmap";

    console.log(
      "[Market Snapshot] Fetching:",
      url
    );

    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        `Market snapshot request failed: ${res.status}`
      );
    }

    const coins: Coin[] = await res.json();

    if (!Array.isArray(coins)) {
      throw new Error(
        "Market snapshot returned invalid data"
      );
    }

    return {
      coins,
      timestamp: Date.now(),
    };
  } catch (err) {
    if (timedOut) {
      throw new Error(
        `Market snapshot request timed out after ${REQUEST_TIMEOUT}ms`
      );
    }

    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/* ----------------------------- */
/* PUBLIC SNAPSHOT STORE          */
/* ----------------------------- */

export async function getMarketSnapshot(
  baseUrl?: string
): Promise<Snapshot> {
  const now = Date.now();

  /* 1. Serve valid cache */

  if (
    cachedSnapshot &&
    now - lastFetchTime < CACHE_TTL
  ) {
    return cachedSnapshot;
  }

  /* 2. Reuse existing request */

  if (inFlightPromise) {
    return inFlightPromise;
  }

  /* 3. Create one fresh request */

  inFlightPromise = fetchMarketSnapshot(baseUrl)
    .then((data) => {
      cachedSnapshot = data;
      lastFetchTime = Date.now();

      return data;
    })
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
}

/* ----------------------------- */
/* FORCE REFRESH                 */
/* ----------------------------- */

export async function refreshMarketSnapshot(): Promise<Snapshot> {
  cachedSnapshot = null;
  lastFetchTime = 0;

  return getMarketSnapshot();
}