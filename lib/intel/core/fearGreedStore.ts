type FearGreedSnapshot = {
  value: number;
  timestamp: number;
};

let cachedFearGreed: FearGreedSnapshot | null = null;
let lastFetchTime = 0;
let inFlightPromise: Promise<FearGreedSnapshot> | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const REQUEST_TIMEOUT = 8000;

/* ----------------------------- */
/* INTERNAL FETCH                */
/* ----------------------------- */

async function fetchFearGreed(): Promise<FearGreedSnapshot> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const res = await fetch("/api/intel/fear-greed", {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error("Failed to fetch Fear & Greed");
    }

    const data = await res.json();

    return {
      value: Number(data.value),
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

export async function getFearGreed() {
  const now = Date.now();

  if (
    cachedFearGreed &&
    now - lastFetchTime < CACHE_TTL
  ) {
    return cachedFearGreed;
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = fetchFearGreed()
    .then((snapshot) => {
      cachedFearGreed = snapshot;
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

export async function refreshFearGreed() {
  cachedFearGreed = null;
  lastFetchTime = 0;

  return getFearGreed();
}