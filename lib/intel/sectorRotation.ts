import type { Coin } from "@/lib/types/coin";
import {
  getMarketSector,
  type MarketSector,
} from "@/lib/intel/core/sectorMap";

export type SectorRotationState =
  | "LEADING_ROTATION"
  | "EXPANDING"
  | "BUILDING"
  | "ROTATION_EXIT"
  | "DORMANT";

export type SectorMarketBias =
  | "RISK_ON_STRUCTURE"
  | "EARLY_ROTATION"
  | "BALANCED_FLOW"
  | "DEFENSIVE_STRUCTURE";

export type SectorData = {
  name: MarketSector;

  change: number;
  participation: number;
  momentum: number;

  acceleration: number;
  relativeStrength: number;

  rotationState: SectorRotationState;
  earlyRotation: boolean;

  leaders: Coin[];
};

export type SectorRotation = {
  sectors: SectorData[];

  dominantSector: MarketSector | null;
  emergingSector: MarketSector | null;
  weakeningSector: MarketSector | null;

  marketBreadth: number;
  rotationConfidence: number;

  marketBias: SectorMarketBias;

  leaders: Coin[];
  laggards: Coin[];

  earlyRotationSectors: MarketSector[];

  narrative: {
    headline: string;
    subtext: string;
  };
};

const weightMap: Record<MarketSector, number> = {
  LARGE_CAP: 1,
  L1: 1,
  INFRA: 1,
  DEFI: 1,
  MEME: 1,
  PAYMENTS: 1,
  OTHER: 1,
};

function clamp(
  value: number,
  min = 0,
  max = 100
) {
  return Math.min(max, Math.max(min, value));
}

function round(
  value: number,
  decimals = 2
) {
  return Number(value.toFixed(decimals));
}

export function buildSectorRotation(
  coins: Coin[],
  previous?: Record<string, number>
): SectorRotation {
  if (!coins.length) {
    return {
      sectors: [],
      dominantSector: null,
      emergingSector: null,
      weakeningSector: null,
      marketBreadth: 0,
      rotationConfidence: 0,
      marketBias: "BALANCED_FLOW",
      leaders: [],
      laggards: [],
      earlyRotationSectors: [],
      narrative: {
        headline: "No sector data available",
        subtext: "Waiting for sufficient market observations.",
      },
    };
  }

  const btc =
    coins.find(
      (coin) =>
        coin.symbol?.toUpperCase() === "BTC"
    );

  const btcChange =
    btc?.change24h ?? 0;

  const grouped: Record<
    string,
    {
      total: number;
      count: number;
      positive: number;
      coins: Coin[];
    }
  > = {};

  for (const coin of coins) {
    const sector = getMarketSector(
      coin.symbol
    );

    if (!grouped[sector]) {
      grouped[sector] = {
        total: 0,
        count: 0,
        positive: 0,
        coins: [],
      };
    }

    grouped[sector].total +=
      coin.change24h ?? 0;

    grouped[sector].count += 1;

    if (
      Math.abs(coin.change24h ?? 0) >
      0.25
    ) {
      grouped[sector].positive += 1;
    }

    grouped[sector].coins.push(coin);
  }

  const sectors: SectorData[] =
    Object.entries(grouped).map(
      ([name, data]) => {
        const sector =
          name as MarketSector;

        const change =
          data.total / data.count;

        const participation =
          (data.positive / data.count) *
          100;

        const previousValue =
          previous?.[sector] ?? change;

        const acceleration =
          change - previousValue;

        const relativeStrength =
          change - btcChange;

        const flowStrength =
          data.coins.reduce(
            (sum, coin) =>
              sum +
              Math.abs(
                coin.change24h ?? 0
              ),
            0
          );

        const weight =
          weightMap[sector] ?? 1;

        /*
         * Momentum combines:
         *
         * - directional price movement
         * - breadth / participation
         * - acceleration
         * - movement intensity
         *
         * This is a sector strength score,
         * not literal capital flow.
         */
        const rawMomentum =
          (
            Math.abs(change) * 2 +
            participation * 0.25 +
            Math.abs(acceleration) * 8 +
            flowStrength * 0.05
          ) * weight;

        const momentum =
          clamp(rawMomentum);

        const earlyRotation =
          acceleration > 0.5 &&
          participation > 60 &&
          relativeStrength > 0.5;

        const rotationState: SectorRotationState =
          change > 8 &&
          acceleration > 1
            ? "LEADING_ROTATION"
            : change > 3
            ? "EXPANDING"
            : change > 0
            ? "BUILDING"
            : change < 0
            ? "ROTATION_EXIT"
            : "DORMANT";

        return {
          name: sector,
          change: round(change),
          participation: round(
            participation,
            1
          ),
          momentum: round(
            momentum,
            1
          ),
          acceleration: round(
            acceleration
          ),
          relativeStrength: round(
            relativeStrength
          ),
          rotationState,
          earlyRotation,
          leaders: [...data.coins]
            .sort(
              (a, b) =>
                b.change24h -
                a.change24h
            )
            .slice(0, 2),
        };
      }
    );

  /*
   * Strongest sector is determined by
   * actual momentum, not object order.
   */
  const ranked = [...sectors].sort(
    (a, b) =>
      b.momentum - a.momentum
  );

  const dominantSector =
    ranked[0]?.name ?? null;

  /*
   * Emerging sectors:
   * positive acceleration + positive
   * relative strength.
   */
  const emerging =
    [...sectors]
      .filter(
        (sector) =>
          sector.acceleration > 0 &&
          sector.relativeStrength > 0
      )
      .sort(
        (a, b) =>
          b.acceleration -
          a.acceleration
      );

  const emergingSector =
    emerging[0]?.name ?? null;

  /*
   * Weakening sectors:
   * negative acceleration.
   */
  const weakening =
    [...sectors]
      .filter(
        (sector) =>
          sector.acceleration < 0
      )
      .sort(
        (a, b) =>
          a.acceleration -
          b.acceleration
      );

  const weakeningSector =
    weakening[0]?.name ?? null;

  /*
   * Sector breadth.
   */
  const positiveSectors =
    sectors.filter(
      (sector) =>
        sector.change > 0
    ).length;

  const marketBreadth =
    sectors.length
      ? positiveSectors /
        sectors.length
      : 0;

  /*
   * Rotation confidence.
   *
   * We deliberately avoid a formula
   * that automatically saturates at 100.
   *
   * Inputs:
   * - sector breadth
   * - leadership separation
   * - participation
   * - acceleration
   */
  const averageParticipation =
    sectors.length
      ? sectors.reduce(
          (sum, sector) =>
            sum +
            sector.participation,
          0
        ) /
        sectors.length
      : 0;

  const leadershipSpread =
    ranked.length >= 2
      ? Math.abs(
          ranked[0].momentum -
            ranked[1].momentum
        )
      : 0;

  const accelerationSignal =
    sectors.length
      ? sectors.reduce(
          (sum, sector) =>
            sum +
            Math.abs(
              sector.acceleration
            ),
          0
        ) /
        sectors.length
      : 0;

  const rotationConfidence =
    clamp(
      marketBreadth * 35 +
        averageParticipation * 0.35 +
        Math.min(
          leadershipSpread * 2,
          15
        ) +
        Math.min(
          accelerationSignal * 5,
          15
        )
    );

  /*
   * Market bias.
   */
  const strongBreadth =
    marketBreadth >= 0.6;

  const strongParticipation =
    averageParticipation >= 60;

  const dominantChange =
    ranked[0]?.change ?? 0;

  let marketBias: SectorMarketBias;

  if (
    strongBreadth &&
    strongParticipation &&
    dominantChange > 3
  ) {
    marketBias =
      "RISK_ON_STRUCTURE";
  } else if (
    emergingSector &&
    emergingSector !==
      dominantSector
  ) {
    marketBias =
      "EARLY_ROTATION";
  } else if (
    marketBreadth >= 0.4
  ) {
    marketBias =
      "BALANCED_FLOW";
  } else {
    marketBias =
      "DEFENSIVE_STRUCTURE";
  }

  /*
   * Early rotation sectors.
   */
  const earlyRotationSectors =
    sectors
      .filter(
        (sector) =>
          sector.earlyRotation
      )
      .sort(
        (a, b) =>
          b.acceleration -
          a.acceleration
      )
      .map(
        (sector) =>
          sector.name
      );

  /*
   * Asset leaders / laggards.
   */
  const sortedCoins =
    [...coins].sort(
      (a, b) =>
        b.change24h -
        a.change24h
    );

  const leaders =
    sortedCoins.slice(0, 3);

  const laggards =
    sortedCoins
      .slice(-3)
      .reverse();

  /*
   * Dynamic narrative.
   */
  let headline: string;
  let subtext: string;

  if (
    dominantSector &&
    ranked[0]?.change > 8 &&
    marketBreadth >= 0.6
  ) {
    headline =
      `${dominantSector} is leading a broad risk-on rotation`;

    subtext =
      `${dominantSector} is the strongest sector while positive performance remains broad across the market.`;
  } else if (
    emergingSector &&
    emergingSector !==
      dominantSector
  ) {
    headline =
      `${emergingSector} is showing early rotation strength`;

    subtext =
      `${emergingSector} is gaining relative strength and accelerating faster than the broader sector complex.`;
  } else if (
    dominantSector
  ) {
    headline =
      `${dominantSector} is currently leading sector performance`;

    subtext =
      `Leadership is concentrated around ${dominantSector}, with rotation conditions still developing.`;
  } else {
    headline =
      "Mixed rotation environment";

    subtext =
      "Capital preference is balanced across sectors with no clear dominant trend.";
  }

  return {
    sectors: ranked,

    dominantSector,
    emergingSector,
    weakeningSector,

    marketBreadth: round(
      marketBreadth,
      2
    ),

    rotationConfidence: round(
      rotationConfidence,
      1
    ),

    marketBias,

    leaders,
    laggards,

    earlyRotationSectors,

    narrative: {
      headline,
      subtext,
    },
  };
}
