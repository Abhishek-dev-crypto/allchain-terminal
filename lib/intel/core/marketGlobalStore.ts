import type { GlobalData } from "@/lib/types/market";

type GlobalSnapshot = {
  data: GlobalData;
  timestamp: number;
};

let cachedGlobal: GlobalSnapshot | null = null;
let lastFetchTime = 0;
let inFlightPromise: Promise<GlobalSnapshot> | null = null;

const CACHE_TTL = 60 * 1000;
const REQUEST_TIMEOUT = 8000;

/* ----------------------------- */
/* INTERNAL FETCH                */
/* ----------------------------- */

async function fetchGlobalMarket(): Promise<GlobalSnapshot> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const res = await fetch("/api/intel/global", {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error("Failed to fetch global market");
    }

    const data: GlobalData = await res.json();

    return {
      data,
      timestamp: Date.now(),
    };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

/* ----------------------------- */
/* PUBLIC STORE                  */
/* ----------------------------- */

export async function getGlobalMarket() {
  const now = Date.now();

  // Serve cache
  if (cachedGlobal && now - lastFetchTime < CACHE_TTL) {
    return cachedGlobal;
  }

  // Deduplicate requests
  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = fetchGlobalMarket()
    .then((snapshot) => {
      cachedGlobal = snapshot;
      lastFetchTime = Date.now();
      inFlightPromise = null;
      return snapshot;
    })
    .catch((err) => {
      inFlightPromise = null;
      throw err;
    });

  return inFlightPromise;
}

/* ----------------------------- */
/* FORCE REFRESH                 */
/* ----------------------------- */

export async function refreshGlobalMarket() {
  cachedGlobal = null;
  lastFetchTime = 0;

  return getGlobalMarket();
}