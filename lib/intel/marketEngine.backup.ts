import type { Coin } from "@/lib/types/coin";
import {
  calculateRegimeConfidence,
  calculateMarketHealth,
} from "@/lib/intel/scoring";

import {
  classifyVolatility,
  classifyBreadth,
  classifyStability,
  calculateDispersion,
  calculateMomentumScore,
  calculateVolatilityScore,
} from "@/lib/intel/helpers";

import { getMarketSector, type MarketSector } from "@/lib/intel/core/sectorMap";

export type MarketRegime =
  | "RISK_ON"
  | "RISK_OFF"
  | "ROTATION"
  | "CHOPPY";

export type SectorRotationState =
  | "LEADING ROTATION"
  | "EXPANDING"
  | "BUILDING"
  | "ROTATION EXIT"
  | "DORMANT";

export type SectorRotationData = {
  name: MarketSector;
  change: number;
  participation: number;
  momentum: number;
  relativeStrength: number;
  earlyRotation: boolean;
  rotationState: SectorRotationState;
  leaders: Coin[];
};

export type SectorRotationIntelligence = {
  sectors: SectorRotationData[];
  topSectors: SectorRotationData[];
  rotationConfidence: number;
  marketBias:
    | "RISK-ON STRUCTURE"
    | "EARLY ROTATION"
    | "DEFENSIVE STRUCTURE";
};

export type MarketEngineOutput = {
  flows: { name: string; avg: number }[];

  avgFlow: number;
  positiveBreadth: number;
  negativeBreadth: number;

  volatility: number;
  participation: number;

  regime: MarketRegime;

  momentum: "ACCELERATING" | "DECELERATING" | "NEUTRAL";

  leaders: Coin[];
  laggards: Coin[];

  btcDominance: number;
  ethDominance: number;
  altStrength: number;

  regimeConfidence: number;
  marketHealth: number;

  volatilityState: "LOW" | "NORMAL" | "ELEVATED" | "EXTREME";
  breadthState: "STRONG" | "WEAK" | "NARROW";
  stability: "STABLE" | "FRAGILE" | "UNSTABLE";

  signals: {
    momentum: { direction: string; strength: number };
    flow: { state: string; score: number };
    sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  };

  sectorRotation: SectorRotationIntelligence;
};

/* ========================= */
/* EMPTY SECTOR INTELLIGENCE */
/* ========================= */

function emptySectorRotation(): SectorRotationIntelligence {
  return {
    sectors: [],
    topSectors: [],
    rotationConfidence: 0,
    marketBias: "DEFENSIVE STRUCTURE",
  };
}

/* ========================= */
/* SECTOR ROTATION ENGINE    */
/* ========================= */

function buildSectorRotation(
  coins: Coin[]
): SectorRotationIntelligence {
  if (!coins.length) {
    return emptySectorRotation();
  }

  const btc = coins.find(
    (coin) => coin.symbol.toUpperCase() === "BTC"
  );

  const marketChange =
    coins.reduce(
      (sum, coin) => sum + (coin.change24h || 0),
      0
    ) / coins.length;

  const grouped: Record<
    MarketSector,
    {
      coins: Coin[];
    }
  > = {
    LARGE_CAP: { coins: [] },
    L1: { coins: [] },
    INFRA: { coins: [] },
    DEFI: { coins: [] },
    MEME: { coins: [] },
    PAYMENTS: { coins: [] },
    OTHER: { coins: [] },
  };

  for (const coin of coins) {
    const sector = getMarketSector(coin.symbol);
    grouped[sector].coins.push(coin);
  }

  const sectors: SectorRotationData[] = Object.entries(grouped)
    .filter(([, data]) => data.coins.length > 0)
    .map(([name, data]) => {
      const sectorCoins = data.coins;

      const change =
        sectorCoins.reduce(
          (sum, coin) => sum + (coin.change24h || 0),
          0
        ) / sectorCoins.length;

      const positiveCount = sectorCoins.filter(
        (coin) => coin.change24h > 0
      ).length;

      const participation =
        (positiveCount / sectorCoins.length) * 100;

      const relativeStrength = change - marketChange;

      const movementStrength =
        sectorCoins.reduce(
          (sum, coin) =>
            sum + Math.abs(coin.change24h || 0),
          0
        ) / sectorCoins.length;

      const momentum = Math.min(
        100,
        Math.abs(change) * 5 +
          participation * 0.35 +
          Math.abs(relativeStrength) * 4 +
          movementStrength * 2
      );

      const earlyRotation =
        relativeStrength > 0.5 &&
        participation >= 60 &&
        change < (btc?.change24h ?? marketChange);

      const rotationState: SectorRotationState =
        change > 8 && relativeStrength > 2
          ? "LEADING ROTATION"
          : change > 3 && relativeStrength > 0
          ? "EXPANDING"
          : change > 0
          ? "BUILDING"
          : relativeStrength < -1
          ? "ROTATION EXIT"
          : "DORMANT";

      return {
        name: name as MarketSector,
        change: Number(change.toFixed(2)),
        participation: Number(participation.toFixed(1)),
        momentum: Number(momentum.toFixed(1)),
        relativeStrength: Number(
          relativeStrength.toFixed(2)
        ),
        earlyRotation,
        rotationState,
        leaders: [...sectorCoins]
          .sort(
            (a, b) =>
              b.change24h - a.change24h
          )
          .slice(0, 2),
      };
    });

  const topSectors = [...sectors]
    .sort(
      (a, b) =>
        b.relativeStrength - a.relativeStrength
    )
    .slice(0, 3);

  const positiveSectorRatio =
    sectors.length > 0
      ? sectors.filter(
          (sector) => sector.change > 0
        ).length / sectors.length
      : 0;

  const averageRelativeStrength =
    sectors.length > 0
      ? sectors.reduce(
          (sum, sector) =>
            sum + Math.abs(sector.relativeStrength),
          0
        ) / sectors.length
      : 0;

  const rotationConfidence = Math.min(
    100,
    positiveSectorRatio * 40 +
      averageRelativeStrength * 10 +
      (topSectors[0]?.momentum ?? 0) * 0.3
  );

  const infrastructure = sectors.find(
    (sector) => sector.name === "INFRA"
  );

  const largeCap = sectors.find(
    (sector) => sector.name === "LARGE_CAP"
  );

  const marketBias =
    infrastructure &&
    infrastructure.momentum > 70 &&
    positiveSectorRatio > 0.6
      ? "RISK-ON STRUCTURE"
      : infrastructure &&
        infrastructure.momentum > 50
      ? "EARLY ROTATION"
      : largeCap &&
        largeCap.change > 0
      ? "EARLY ROTATION"
      : "DEFENSIVE STRUCTURE";

  return {
    sectors,
    topSectors,
    rotationConfidence: Number(
      rotationConfidence.toFixed(1)
    ),
    marketBias,
  };
}

/* ========================= */
/* MARKET ENGINE              */
/* ========================= */

export function buildMarketEngine(
  coins: Coin[]
): MarketEngineOutput {
  if (!coins.length) {
    return {
      flows: [],
      avgFlow: 0,
      positiveBreadth: 0,
      negativeBreadth: 0,
      volatility: 0,
      participation: 0,
      regime: "CHOPPY",
      momentum: "NEUTRAL",
      leaders: [],
      laggards: [],
      btcDominance: 0,
      ethDominance: 0,
      altStrength: 0,
      regimeConfidence: 0,
      marketHealth: 0,
      volatilityState: "LOW",
      breadthState: "NARROW",
      stability: "STABLE",
      signals: {
        momentum: {
          direction: "NEUTRAL",
          strength: 0,
        },
        flow: {
          state: "NEUTRAL",
          score: 0,
        },
        sentiment: "NEUTRAL",
      },
      sectorRotation: emptySectorRotation(),
    };
  }

  /* ====================== */
  /* SECTOR FLOWS            */
  /* ====================== */

  const grouped: Record<
    string,
    { total: number; count: number }
  > = {};

  coins.forEach((coin) => {
    const sector = getMarketSector(coin.symbol);

    if (!grouped[sector]) {
      grouped[sector] = {
        total: 0,
        count: 0,
      };
    }

    grouped[sector].total +=
      coin.change24h;

    grouped[sector].count += 1;
  });

  const flows = Object.entries(grouped).map(
    ([name, data]) => ({
      name,
      avg: data.total / data.count,
    })
  );

  const values = flows.map(
    (flow) => flow.avg
  );

  const avgFlow =
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / (values.length || 1);

  const positiveBreadth =
    (coins.filter(
      (coin) => coin.change24h > 0
    ).length /
      coins.length) *
    100;

  const negativeBreadth =
    100 - positiveBreadth;

  const volatility =
    coins.reduce(
      (sum, coin) =>
        sum + Math.abs(coin.change24h),
      0
    ) / coins.length;

  const participation =
    (coins.filter(
      (coin) =>
        Math.abs(coin.change24h) > 3
    ).length /
      coins.length) *
    100;

  /* ====================== */
  /* REGIME                  */
  /* ====================== */

  let regime: MarketRegime = "CHOPPY";

  const dispersion =
    calculateDispersion(values);

  if (
    avgFlow < -2 &&
    negativeBreadth > 70
  ) {
    regime = "RISK_OFF";
  } else if (
    avgFlow > 2 &&
    positiveBreadth > 65
  ) {
    regime = "RISK_ON";
  } else if (
    dispersion > 5
  ) {
    regime = "ROTATION";
  }

  /* ====================== */
  /* MOMENTUM                */
  /* ====================== */

  const momentum: MarketEngineOutput["momentum"] =
    avgFlow > 1.5 &&
    positiveBreadth > 60
      ? "ACCELERATING"
      : avgFlow < -1.5 &&
        negativeBreadth > 60
      ? "DECELERATING"
      : "NEUTRAL";

  /* ====================== */
  /* LEADERS / LAGGARDS      */
  /* ====================== */

  const sorted = [...coins].sort(
    (a, b) =>
      b.change24h - a.change24h
  );

  const leaders = sorted.slice(0, 5);

  const laggards = [...sorted]
    .reverse()
    .slice(0, 5);

  /* ====================== */
  /* DOMINANCE               */
  /* ====================== */

  const totalCap =
    coins.reduce(
      (sum, coin) =>
        sum + (coin.marketCap ?? 0),
      0
    ) || 1;

  const btc = coins.find(
    (coin) => coin.symbol === "BTC"
  );

  const eth = coins.find(
    (coin) => coin.symbol === "ETH"
  );

  const btcDominance =
    ((btc?.marketCap || 0) /
      totalCap) *
    100;

  const ethDominance =
    ((eth?.marketCap || 0) /
      totalCap) *
    100;

  const altStrength = Math.max(
    0,
    100 -
      btcDominance -
      ethDominance
  );

  /* ====================== */
  /* SIGNALS                 */
  /* ====================== */

  const momentumStrength =
    Math.min(
      100,
      Math.abs(avgFlow) * 20 +
        participation
    );

  const flowState =
    participation > 60 &&
    avgFlow > 1
      ? "ACCUMULATION"
      : participation > 60 &&
        avgFlow < -1
      ? "DISTRIBUTION"
      : "NEUTRAL";

  const sentiment:
    | "BULLISH"
    | "BEARISH"
    | "NEUTRAL" =
    positiveBreadth > 60
      ? "BULLISH"
      : negativeBreadth > 60
      ? "BEARISH"
      : "NEUTRAL";

  /* ====================== */
  /* SCORES                  */
  /* ====================== */

  const regimeConfidence =
    calculateRegimeConfidence({
      participationScore:
        participation,
      volatilityScore:
        calculateVolatilityScore(
          volatility
        ),
      breadthScore:
        positiveBreadth,
      momentumScore:
        calculateMomentumScore(
          avgFlow
        ),
    });

  const marketHealth =
    calculateMarketHealth({
      momentumScore:
        calculateMomentumScore(
          avgFlow
        ),
      breadthScore:
        positiveBreadth,
      participationScore:
        participation,
      volatilityScore:
        calculateVolatilityScore(
          volatility
        ),
    });

  const volatilityState =
    classifyVolatility(volatility);

  const breadthState =
    classifyBreadth(
      positiveBreadth
    );

  const stability =
    classifyStability(
      volatility,
      negativeBreadth
    );

  /* ====================== */
  /* SECTOR ROTATION         */
  /* ====================== */

  const sectorRotation =
    buildSectorRotation(coins);

  /* ====================== */
  /* RESULT                  */
  /* ====================== */

  return {
    flows,

    avgFlow: Number(
      avgFlow.toFixed(2)
    ),

    positiveBreadth: Number(
      positiveBreadth.toFixed(1)
    ),

    negativeBreadth: Number(
      negativeBreadth.toFixed(1)
    ),

    volatility: Number(
      volatility.toFixed(2)
    ),

    participation: Number(
      participation.toFixed(1)
    ),

    regime,

    momentum,

    leaders,

    laggards,

    btcDominance: Number(
      btcDominance.toFixed(1)
    ),

    ethDominance: Number(
      ethDominance.toFixed(1)
    ),

    altStrength: Number(
      altStrength.toFixed(1)
    ),

    regimeConfidence: Number(
      regimeConfidence.toFixed(1)
    ),

    marketHealth: Number(
      marketHealth.toFixed(1)
    ),

    volatilityState,

    breadthState,

    stability,

    signals: {
      momentum: {
        direction: momentum,
        strength: momentumStrength,
      },

      flow: {
        state: flowState,
        score:
          flowState ===
          "ACCUMULATION"
            ? participation
            : 100 - participation,
      },

      sentiment,
    },

    sectorRotation,
  };
}
