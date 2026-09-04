import type { Coin } from "@/lib/types/coin";

export type MarketSnapshot = {
  coins: Coin[];

  breadth: {
    greenPercent: number;
    redPercent: number;
    neutralPercent: number;
  };

  momentum: {
    average: number;
    strength: number;
    direction: "ACCELERATING" | "DECELERATING" | "NEUTRAL";
    leaders: Coin[];
    laggards: Coin[];
  };

  volatility: {
    average: number;
    level: "LOW" | "MEDIUM" | "HIGH";
  };

  flow: {
  state: "ACCUMULATION" | "DISTRIBUTION" | "NEUTRAL";
  score: number;
  pressure: number;
  volumeParticipation: number;
};

  dominance: {
    btc: number;
    eth: number;
    altStrength: number;
  };

  marketState: {
    mood: "RISK_ON" | "RISK_OFF" | "BALANCED";
    conviction: "LOW" | "MEDIUM" | "HIGH";
  };
};

/* ================= HELPERS ================= */

function avg(arr: number[]) {
  return arr.length
    ? arr.reduce((a, b) => a + b, 0) / arr.length
    : 0;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

function getMomentumDirection(
  value: number
): "ACCELERATING" | "DECELERATING" | "NEUTRAL" {
  if (value > 4) return "ACCELERATING";
  if (value < -2) return "DECELERATING";
  return "NEUTRAL";
}

function isBTC(symbol: string) {
  return symbol?.toUpperCase().includes("BTC");
}

function isETH(symbol: string) {
  return symbol?.toUpperCase().includes("ETH");
}

/* ================= ENGINE ================= */

export function buildMarketSnapshot(
  coins: Coin[]
): MarketSnapshot {
  if (!coins?.length) {
    return {
      coins: [],
      breadth: {
        greenPercent: 0,
        redPercent: 0,
        neutralPercent: 0,
      },

      momentum: {
        average: 0,
        strength: 0,
        direction: "NEUTRAL",
        leaders: [],
        laggards: [],
      },

      volatility: {
        average: 0,
        level: "LOW",
      },

      flow: {
  state: "NEUTRAL",
  score: 0,
  pressure: 0,
  volumeParticipation: 0,
},

      dominance: {
        btc: 0,
        eth: 0,
        altStrength: 0,
      },

      marketState: {
        mood: "BALANCED",
        conviction: "LOW",
      },
    };
  }

  const sorted = [...coins].sort(
    (a, b) => b.change24h - a.change24h
  );

  /* ================= BREADTH ================= */

  const green = coins.filter(
    (c) => c.change24h > 0
  );

  const red = coins.filter(
    (c) => c.change24h < 0
  );

  const neutral = coins.filter(
    (c) => c.change24h === 0
  );

  const greenPercent =
    (green.length / coins.length) * 100;

  const redPercent =
    (red.length / coins.length) * 100;

  const neutralPercent = clamp(
    100 - greenPercent - redPercent
  );

  /* ================= MOMENTUM ================= */

  const averageMomentum = avg(
    coins.map((c) => c.change24h)
  );

  const leaders = sorted.slice(0, 5);

  const laggards = sorted
    .slice(-5)
    .reverse();

  const momentumStrength = avg(
    leaders.map((c) => Math.abs(c.change24h))
  );

  const direction =
    getMomentumDirection(averageMomentum);

 /* ================= VOLATILITY ================= */

/*
 * Measures the average 24h percentage trading range
 * across all assets that have valid 24h high/low data.
 *
 * Formula:
 *
 * ((24h High - 24h Low) / 24h Low) × 100
 *
 * Percentage range is used instead of absolute price range
 * so assets with different prices can be compared correctly.
 */

const volatilityRanges = coins
  .map((coin) => {
    const high = coin.high24h;
    const low = coin.low24h;

    if (
      typeof high !== "number" ||
      typeof low !== "number" ||
      !Number.isFinite(high) ||
      !Number.isFinite(low) ||
      high <= 0 ||
      low <= 0 ||
      high < low
    ) {
      return null;
    }

    return ((high - low) / low) * 100;
  })
  .filter(
    (value): value is number =>
      value !== null && Number.isFinite(value)
  );

const volatilityAvg = avg(volatilityRanges);

const volatilityLevel =
  volatilityRanges.length === 0
    ? "LOW"
    : volatilityAvg > 6
      ? "HIGH"
      : volatilityAvg > 3
        ? "MEDIUM"
        : "LOW";

 /* ================= FLOW ================= */

/*
 * CAPITAL FLOW ENGINE
 *
 * Estimates directional capital pressure using:
 *
 * - price movement
 * - trading volume
 * - magnitude of movement
 *
 * This is inferred market pressure, not literal
 * exchange-level capital flow.
 */

const totalVolume = coins.reduce(
  (sum, coin) =>
    sum + Math.max(coin.volume24h || 0, 0),
  0
);

/*
 * Volume-weighted directional movement.
 *
 * tanh() prevents one large percentage mover
 * from completely dominating the calculation.
 */
const weightedDirectionalFlow =
  coins.reduce(
    (sum, coin) => {
      const volume = Math.max(
        coin.volume24h || 0,
        0
      );

      const change =
        coin.change24h || 0;

      const directionalStrength =
        Math.tanh(change / 5);

      return (
        sum +
        volume * directionalStrength
      );
    },
    0
  );

/*
 * Raw directional pressure.
 *
 * Range:
 * approximately -100 → +100
 */
const volumePressure =
  totalVolume > 0
    ? (
        weightedDirectionalFlow /
        totalVolume
      ) * 100
    : 0;

/*
 * Flow score.
 *
 * 50 = neutral
 * 50–100 = accumulation
 * 0–50 = distribution
 */
const flowScore = clamp(
  50 + volumePressure / 2
);

/*
 * Participation measures how many assets
 * are actually moving meaningfully.
 *
 * A 0.01% move should not count as meaningful
 * capital participation.
 */
const participatingVolume =
  coins.reduce(
    (sum, coin) => {
      const change = Math.abs(
        coin.change24h || 0
      );

      /*
       * Gradually increase participation
       * as price movement becomes meaningful.
       *
       * 0% movement = 0 participation
       * 1% movement = meaningful participation
       * 2%+ movement = full participation
       */
      const participationWeight = Math.min(
        change / 2,
        1
      );

      return (
        sum +
        (coin.volume24h || 0) *
          participationWeight
      );
    },
    0
  );

const volumeParticipation =
  totalVolume > 0
    ? (
        participatingVolume /
        totalVolume
      ) * 100
    : 0;

/*
 * Capital-flow state.
 *
 * Require both:
 * 1. directional pressure
 * 2. market breadth
 */
const flowState: MarketSnapshot["flow"]["state"] =
  volumePressure >= 12 &&
  greenPercent >= 55
    ? "ACCUMULATION"
    : volumePressure <= -12 &&
      redPercent >= 55
    ? "DISTRIBUTION"
    : "NEUTRAL";

  /* ================= DOMINANCE ================= */

  const totalCap =
    coins.reduce(
      (sum, coin) =>
        sum + (coin.marketCap || 0),
      0
    ) || 1;

  const btcCap =
    coins.find(
      (coin) => isBTC(coin.symbol)
    )?.marketCap || 0;

  const ethCap =
    coins.find(
      (coin) => isETH(coin.symbol)
    )?.marketCap || 0;

  const btcDominance =
    (btcCap / totalCap) * 100;

  const ethDominance =
    (ethCap / totalCap) * 100;

  const altStrength = clamp(
    100 -
      btcDominance -
      ethDominance
  );

  /* ================= MARKET STATE ================= */

  const marketMood =
    greenPercent > 65
      ? "RISK_ON"
      : redPercent > 65
      ? "RISK_OFF"
      : "BALANCED";

  const conviction =
    volatilityAvg > 6
      ? "HIGH"
      : volatilityAvg > 3
      ? "MEDIUM"
      : "LOW";

  /* ================= RESULT ================= */

  return {
    coins: sorted,

    breadth: {
      greenPercent: clamp(
        greenPercent
      ),

      redPercent: clamp(
        redPercent
      ),

      neutralPercent,
    },

    momentum: {
      average:
        Number(
          averageMomentum.toFixed(2)
        ),

      strength:
        Number(
          momentumStrength.toFixed(2)
        ),

      direction,

      leaders,

      laggards,
    },

    volatility: {
      average:
        Number(
          volatilityAvg.toFixed(2)
        ),

      level: volatilityLevel,
    },

    flow: {
  state: flowState,

  score: Number(
    flowScore.toFixed(2)
  ),

  pressure: Number(
    volumePressure.toFixed(2)
  ),

  volumeParticipation: Number(
    volumeParticipation.toFixed(2)
  ),
},

    dominance: {
      btc: btcDominance,
      eth: ethDominance,
      altStrength,
    },

    marketState: {
      mood: marketMood,
      conviction,
    },
  };
}