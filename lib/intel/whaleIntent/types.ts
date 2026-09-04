import type { SmartMoneyTransfer } from "../smartMoney/types";

/* =========================================================
   WHALE INTENT TYPES
========================================================= */

export type WhaleIntentDirection =
  | "ACCUMULATION"
  | "DISTRIBUTION"
  | "POSITIONING"
  | "DE_RISKING"
  | "ROTATION"
  | "NEUTRAL"
  | "UNKNOWN";

export type WhaleIntentStrength =
  | "STRONG"
  | "MODERATE"
  | "WEAK"
  | "INSUFFICIENT";

export type WhaleActivityLevel =
  | "EXTREME"
  | "HIGH"
  | "MODERATE"
  | "LOW";

export type WhaleEvidence = {
  type:
    | "EXCHANGE_FLOW"
    | "ACTIVITY_ACCELERATION"
    | "LARGE_TRANSFER"
    | "REPEATED_BEHAVIOR"
    | "WALLET_CONCENTRATION"
    | "DIRECTIONAL_FLOW"
    | "MULTI_WALLET"
    | "ROTATION";

  description: string;

  valueUsd?: number;

  weight: number;
};

export type WhaleWalletBehavior = {
  address: string;

  chain: string;

  assets: string[];

  transactionCount: number;

  totalVolumeUsd: number;

  inflowUsd: number;

  outflowUsd: number;

  netFlowUsd: number;

  largestTransactionUsd: number;

  recentTransactionCount: number;

  previousTransactionCount: number;

  recentVolumeUsd: number;

  previousVolumeUsd: number;

  activityAcceleration: number;

  accumulationUsd: number;

  distributionUsd: number;

  positioningUsd: number;

  deRiskingUsd: number;

  rotationUsd: number;

  intent: WhaleIntentDirection;

  intentScore: number;

  confidence: number;

  activity: WhaleActivityLevel;

  evidence: WhaleEvidence[];

  firstSeen: number;

  lastSeen: number;
};

export type WhaleIntentAsset = {
  symbol: string;

  whaleCount: number;

  transactionCount: number;

  totalVolumeUsd: number;

  accumulationUsd: number;

  distributionUsd: number;

  positioningUsd: number;

  deRiskingUsd: number;

  rotationUsd: number;

  intent: WhaleIntentDirection;

  intentScore: number;

  confidence: number;

  activity: WhaleActivityLevel;

  evidence: WhaleEvidence[];
};

export type WhaleIntentOutput = {
  overallIntent: WhaleIntentDirection;

  overallScore: number;

  overallConfidence: number;

  whaleCount: number;

  activeWhaleCount: number;

  totalVolumeUsd: number;

  accumulationUsd: number;

  distributionUsd: number;

  positioningUsd: number;

  deRiskingUsd: number;

  rotationUsd: number;

  assets: WhaleIntentAsset[];

  wallets: WhaleWalletBehavior[];

  keyDrivers: string[];

  generatedAt: number;

  observationWindow: {
    recentHours: number;

    baselineHours: number;
  };
};

export type WhaleIntentInput = {
  transfers: SmartMoneyTransfer[];
};