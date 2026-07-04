import type { Coin } from "@/lib/types/coin";

type Snapshot = {
  coins: Coin[];
  timestamp: number;
};

let cachedSnapshot: Snapshot | null = null;
let lastFetchTime = 0;
let inFlightPromise: Promise<Snapshot> | null = null;

const CACHE_TTL = 60 * 1000; // 60s
const REQUEST_TIMEOUT = 8000;

/* ----------------------------- */
/* INTERNAL FETCH (SAFE)         */
/* ----------------------------- */

async function fetchMarketSnapshot(): Promise<Snapshot> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const res = await fetch("/api/intel/heatmap", {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error("Failed to fetch market snapshot");
    }

    const coins: Coin[] = await res.json();

    return {
      coins,
      timestamp: Date.now(),
    };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

/* ----------------------------- */
/* PUBLIC SNAPSHOT STORE        */
/* ----------------------------- */

export async function getMarketSnapshot(): Promise<Snapshot> {
  const now = Date.now();

  /* 1. Serve cache */
  if (cachedSnapshot && now - lastFetchTime < CACHE_TTL) {
    return cachedSnapshot;
  }

  /* 2. Dedupe in-flight request */
  if (inFlightPromise) {
    return inFlightPromise;
  }

  /* 3. Fetch fresh */
  inFlightPromise = fetchMarketSnapshot()
    .then((data) => {
      cachedSnapshot = data;
      lastFetchTime = Date.now();
      inFlightPromise = null;
      return data;
    })
    .catch((err) => {
      inFlightPromise = null;
      throw err;
    });

  return inFlightPromise;
}

/* ----------------------------- */
/* FORCE REFRESH                */
/* ----------------------------- */

export async function refreshMarketSnapshot(): Promise<Snapshot> {
  cachedSnapshot = null;
  lastFetchTime = 0;
  return getMarketSnapshot();
}