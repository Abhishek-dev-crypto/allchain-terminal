import type { Coin } from "@/lib/types/coin";

export type Flow = {
  name: string;
  avg: number;
  intensity: number;
};

export type TieredOutput = {
  free: FreeIntel;
  pro: ProIntel;
  premium: PremiumIntel;
};

export type FreeIntel = {
  title: string;
  desc: string;
  tone: "bullish" | "bearish" | "mixed" | "neutral";
};

export type ProIntel = {
  structure: string;
  momentum: string;
  leadership: string;
  liquidity: string;
  dispersion: number;
  correlation: string;
};

export type PremiumIntel = {
  riskScore: number;
  continuationProb: number;
  rotationProb: number;
  reversalProb: number;
  regimeBias: string;
};

/**
 * 🧠 TIERED MARKET INTELLIGENCE ENGINE
 */
export function buildTieredIntel(
  flows: Flow[]
): TieredOutput {

  // -----------------------------------
  // 🛡 SAFE DATA EXTRACTION
  // -----------------------------------

  const values = flows.map((f) => f.avg);

  const avgFlow =
    values.reduce((sum, v) => sum + v, 0) /
    (values.length || 1);

  const negativeRatio =
    flows.filter((f) => f.avg < 0).length /
    (flows.length || 1);

  const dispersion =
    values.length > 0
      ? Math.max(...values) - Math.min(...values)
      : 0;

  const leader =
    flows.length > 0
      ? flows.reduce((a, b) =>
          Math.abs(a.avg) > Math.abs(b.avg)
            ? a
            : b
        )
      : null;

  const leaderAvg = leader?.avg ?? 0;
  const leaderName = leader?.name ?? "UNKNOWN";

  // -----------------------------------
  // 🧠 SECTOR SNAPSHOTS
  // -----------------------------------

  const infra =
    flows.find((f) => f.name === "INFRA")?.avg ?? 0;

  const lcap =
    flows.find((f) => f.name === "LARGE_CAP")?.avg ?? 0;

  const meme =
    flows.find((f) => f.name === "MEME")?.avg ?? 0;

  // -----------------------------------
  // 🟢 FREE INTELLIGENCE
  // -----------------------------------

  let free: FreeIntel;

  if (
    avgFlow < -2 &&
    negativeRatio > 0.6
  ) {
    free = {
      title: "Risk-off phase",
      desc: "Capital is broadly exiting risk assets.",
      tone: "bearish",
    };
  }
  else if (
    avgFlow > 1.5 &&
    negativeRatio < 0.4
  ) {
    free = {
      title: "Risk-on expansion",
      desc: "Capital is flowing across multiple sectors.",
      tone: "bullish",
    };
  }
  else if (
    dispersion > 6
  ) {
    free = {
      title: "Rotation phase",
      desc: "Capital is rotating between sectors selectively.",
      tone: "mixed",
    };
  }
  else {
    free = {
      title: "Choppy conditions",
      desc: "No strong directional bias detected.",
      tone: "neutral",
    };
  }

  // -----------------------------------
  // 🟡 PRO INTELLIGENCE
  // -----------------------------------

  const structure =
    dispersion < 3
      ? "High correlation market structure"
      : dispersion < 6
      ? "Moderate sector divergence"
      : "Fragmented cross-sector structure";

  const momentum =
    avgFlow < -2
      ? "Accelerating downside momentum"
      : avgFlow < 0
      ? "Mild bearish pressure"
      : avgFlow > 2
      ? "Strong upside expansion"
      : "Neutral directional momentum";

  const leadership =
    leaderName +
    (leaderAvg < 0
      ? " driving downside pressure"
      : " leading upside expansion");

  const liquidity =
    negativeRatio > 0.7
      ? "Broad-based liquidity exit"
      : negativeRatio > 0.4
      ? "Selective distribution pressure"
      : "Healthy liquidity participation";

  const correlation =
    dispersion < 3
      ? "Highly correlated regime"
      : dispersion < 6
      ? "Partial sector decoupling"
      : "Broken market correlation";

  const pro: ProIntel = {
    structure,
    momentum,
    leadership,
    liquidity,
    dispersion: Number(dispersion.toFixed(2)),
    correlation,
  };

  // -----------------------------------
  // 🔴 PREMIUM INTELLIGENCE
  // -----------------------------------

  const riskScore = Math.min(
    100,
    negativeRatio * 35 +
Math.abs(avgFlow) * 8 +
dispersion * 4
  );

  const continuationProb =
    avgFlow < -2 && dispersion < 5
      ? 0.75
      : avgFlow > 2
      ? 0.70
      : 0.55;

  const rotationProb =
    dispersion > 6 &&
    infra < 0 &&
    lcap < 0
      ? 0.70
      : meme > 2 && infra > 1
      ? 0.65
      : 0.40;

  const reversalProb =
    dispersion < 3 &&
    Math.abs(avgFlow) < 1
      ? 0.60
      : 0.35;

  const regimeBias =
    riskScore > 70
      ? "High stress market regime"
      : rotationProb > 0.6
      ? "Sector rotation setup forming"
      : continuationProb > 0.65
      ? "Trend continuation favored"
      : "Indecisive transition environment";

  const premium: PremiumIntel = {
    riskScore: Number(riskScore.toFixed(1)),

    continuationProb: Number(
      (continuationProb * 100).toFixed(1)
    ),

    rotationProb: Number(
      (rotationProb * 100).toFixed(1)
    ),

    reversalProb: Number(
      (reversalProb * 100).toFixed(1)
    ),

    regimeBias,
  };

  // -----------------------------------
  // 🚀 FINAL ENGINE OUTPUT
  // -----------------------------------

  return {
    free,
    pro,
    premium,
  };
}