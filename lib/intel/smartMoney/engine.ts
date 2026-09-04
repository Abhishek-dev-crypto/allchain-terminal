
import "server-only";

import type {
  SmartMoneyAsset,
  SmartMoneyDirection,
  SmartMoneyIntent,
  SmartMoneyActivity,
  SmartMoneyOutput,
  SmartMoneyTransfer,
} from "./types";

import {
  discoverSmartWallets,
  type SmartWalletCandidate,
} from "./walletDiscovery";

/* =========================================================
   SMART MONEY ENGINE V2
========================================================= */

/**
 * Smart Money is an inference layer.
 *
 * This engine intentionally avoids claiming that a wallet
 * is "smart" merely because it is large.
 *
 * Signal strength comes from:
 *
 * 1. meaningful capital
 * 2. repeated activity
 * 3. unique wallet participation
 * 4. identifiable counterparties
 * 5. directional behavior
 * 6. wallet confidence
 *
 * Important:
 *
 * A blockchain transfer is NOT automatically a trade.
 *
 * Exchange -> qualified wallet
 *     = accumulation evidence
 *
 * Qualified wallet -> exchange
 *     = distribution / de-risking evidence
 *
 * Qualified wallet -> qualified wallet
 *     = rotation / positioning evidence
 *
 * Unknown -> qualified wallet
 *     = weak accumulation evidence
 *
 * qualified wallet -> unknown
 *     = weak de-risking evidence
 */

/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
  MIN_TRANSFER_USD: 100_000,

  LARGE_TRANSACTION_USD: 100_000,

  STRONG_TRANSACTION_USD: 1_000_000,

  MODERATE_ACTIVITY_TRANSACTIONS: 4,

  HIGH_ACTIVITY_TRANSACTIONS: 10,

  EXTREME_ACTIVITY_TRANSACTIONS: 20,

  MODERATE_FLOW_USD: 1_000_000,

  HIGH_FLOW_USD: 5_000_000,

  EXTREME_FLOW_USD: 10_000_000,

  MIN_SMART_MONEY_SCORE: 35,

  STRONG_DIRECTIONAL_SCORE: 55,

  DIRECTION_MARGIN: 10,

  OVERALL_DIRECTION_MARGIN: 1.15,

  MAX_DRIVERS: 5,

  MAX_ASSETS: 50,

  /*
   * Unknown counterparties receive less directional weight.
   *
   * This is important because:
   *
   * unknown -> whale
   *
   * does NOT necessarily mean accumulation.
   */
  UNKNOWN_COUNTERPARTY_WEIGHT: 0.35,

  /*
   * Protocol interactions are contextual rather than
   * automatically bullish or bearish.
   */
  PROTOCOL_FLOW_WEIGHT: 0.75,

  /*
   * Smart -> Smart transfers indicate movement of capital,
   * but not necessarily accumulation/distribution.
   */
  ROTATION_DIRECTIONAL_WEIGHT: 0.20,
} as const;

/* =========================================================
   SCORE WEIGHTS
========================================================= */

const SCORE_WEIGHTS = {
  capital: 0.25,

  direction: 0.30,

  transactions: 0.15,

  participation: 0.15,

  walletConfidence: 0.15,
} as const;

/* =========================================================
   TYPES
========================================================= */

type AddressRole =
  | "EXCHANGE"
  | "PROTOCOL"
  | "WHALE"
  | "SMART"
  | "INSTITUTIONAL"
  | "UNKNOWN";

type FlowBehavior =
  | "ACCUMULATION"
  | "DISTRIBUTION"
  | "POSITIONING"
  | "ROTATION"
  | "DE_RISKING"
  | "NEUTRAL";

type AssetAccumulator = {
  symbol: string;

  inflowUsd: number;

  outflowUsd: number;

  accumulationUsd: number;

  distributionUsd: number;

  positioningUsd: number;

  rotationUsd: number;

  deRiskingUsd: number;

  directionalEvidenceUsd: number;

  largeTransactions: number;

  strongTransactions: number;

  transferCount: number;

  smartWalletAddresses: Set<string>;

  walletConfidenceByAddress: Map<string, number>;

  drivers: Set<string>;
};

/* =========================================================
   HELPERS
========================================================= */

function safeNumber(
  value: unknown
): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function round(
  value: number,
  decimals = 2
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Number(
    value.toFixed(decimals)
  );
}

function clamp(
  value: number,
  min = 0,
  max = 100
): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(
    max,
    Math.max(min, value)
  );
}

function normalizeAddress(
  address: string | undefined
): string {
  return (
    address || ""
  )
    .trim()
    .toLowerCase();
}

function normalizeSymbol(
  symbol: string | undefined
): string {
  return (
    symbol ||
    "UNKNOWN"
  )
    .trim()
    .toUpperCase();
}

function normalizeLabel(
  label: string
): string {
  return label
    .trim()
    .toLowerCase();
}

/* =========================================================
   TRANSFER VALIDATION
========================================================= */

function getTransferUsdValue(
  transfer: SmartMoneyTransfer
): number {
  const valueUsd =
    safeNumber(
      transfer.valueUsd
    );

  /*
   * Never infer USD from raw token value.
   */
  if (
    valueUsd <= 0
  ) {
    return 0;
  }

  return valueUsd;
}

function getTransferTimestamp(
  transfer: SmartMoneyTransfer
): number {
  const timestamp =
    safeNumber(
      transfer.timestamp
    );

  return timestamp > 0
    ? timestamp
    : Date.now();
}

/* =========================================================
   DUPLICATE PROTECTION
========================================================= */

function buildTransferKey(
  transfer: SmartMoneyTransfer
): string {
  const hash =
    (
      transfer.transactionHash ||
      ""
    )
      .trim()
      .toLowerCase();

  const from =
    normalizeAddress(
      transfer.fromAddress
    );

  const to =
    normalizeAddress(
      transfer.toAddress
    );

  const symbol =
    normalizeSymbol(
      transfer.tokenSymbol
    );

  /*
   * Some providers may return multiple transfers
   * in the same transaction.
   *
   * Therefore transactionHash alone is NOT enough.
   */
  return [
    hash,
    from,
    to,
    symbol,
    String(
      safeNumber(
        transfer.value
      )
    ),
    String(
      safeNumber(
        transfer.valueUsd
      )
    ),
  ].join("|");
}

function deduplicateTransfers(
  transfers: SmartMoneyTransfer[]
): SmartMoneyTransfer[] {
  const seen =
    new Set<string>();

  const result:
    SmartMoneyTransfer[] =
    [];

  for (
    const transfer of transfers
  ) {
    const key =
      buildTransferKey(
        transfer
      );

    if (
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);
    result.push(
      transfer
    );
  }

  return result;
}

/* =========================================================
   ADDRESS ROLE
========================================================= */

function getAddressRole(
  address: string,
  walletsByAddress: Map<
    string,
    SmartWalletCandidate
  >
): AddressRole {
  const normalized =
    normalizeAddress(
      address
    );

  if (!normalized) {
    return "UNKNOWN";
  }

  const wallet =
    walletsByAddress.get(
      normalized
    );

  if (!wallet) {
    return "UNKNOWN";
  }

  switch (
    wallet.classification
  ) {
    case "EXCHANGE":
      return "EXCHANGE";

    case "PROTOCOL":
      return "PROTOCOL";

    case "WHALE":
      return "WHALE";

    case "SMART":
      return "SMART";

    case "INSTITUTIONAL_LIKE":
      return "INSTITUTIONAL";

    default:
      return "UNKNOWN";
  }
}

/* =========================================================
   QUALIFIED SMART ROLE
========================================================= */

function isQualifiedSmartRole(
  role: AddressRole
): boolean {
  return (
    role === "SMART" ||
    role === "WHALE" ||
    role === "INSTITUTIONAL"
  );
}

/* =========================================================
   TRANSFER BEHAVIOR
========================================================= */

function inferTransferBehavior(
  transfer: SmartMoneyTransfer,
  walletsByAddress: Map<
    string,
    SmartWalletCandidate
  >
): {
  behavior: FlowBehavior;
  evidenceWeight: number;
} {
  const fromRole =
    getAddressRole(
      transfer.fromAddress,
      walletsByAddress
    );

  const toRole =
    getAddressRole(
      transfer.toAddress,
      walletsByAddress
    );

  const smartFrom =
    isQualifiedSmartRole(
      fromRole
    );

  const smartTo =
    isQualifiedSmartRole(
      toRole
    );

  /* =======================================================
     SELF TRANSFER
  ======================================================= */

  if (
    normalizeAddress(
      transfer.fromAddress
    ) ===
    normalizeAddress(
      transfer.toAddress
    )
  ) {
    return {
      behavior:
        "NEUTRAL",

      evidenceWeight: 0,
    };
  }

  /* =======================================================
     EXCHANGE FLOWS
  ======================================================= */

  if (
    fromRole === "EXCHANGE" &&
    smartTo
  ) {
    return {
      behavior:
        "ACCUMULATION",

      evidenceWeight: 1,
    };
  }

  if (
    smartFrom &&
    toRole === "EXCHANGE"
  ) {
    return {
      behavior:
        "DISTRIBUTION",

      evidenceWeight: 1,
    };
  }

  /* =======================================================
     PROTOCOL FLOWS
  ======================================================= */

  if (
    fromRole === "PROTOCOL" &&
    smartTo
  ) {
    return {
      behavior:
        "POSITIONING",

      evidenceWeight:
        CONFIG.PROTOCOL_FLOW_WEIGHT,
    };
  }

  if (
    smartFrom &&
    toRole === "PROTOCOL"
  ) {
    return {
      behavior:
        "POSITIONING",

      evidenceWeight:
        CONFIG.PROTOCOL_FLOW_WEIGHT,
    };
  }

  /* =======================================================
     SMART -> SMART
  ======================================================= */

  if (
    smartFrom &&
    smartTo
  ) {
    return {
      behavior:
        "ROTATION",

      evidenceWeight: 1,
    };
  }

  /* =======================================================
     UNKNOWN -> SMART
  ======================================================= */

  if (
    smartTo
  ) {
    return {
      behavior:
        "ACCUMULATION",

      evidenceWeight:
        CONFIG.UNKNOWN_COUNTERPARTY_WEIGHT,
    };
  }

  /* =======================================================
     SMART -> UNKNOWN
  ======================================================= */

  if (
    smartFrom
  ) {
    return {
      behavior:
        "DE_RISKING",

      evidenceWeight:
        CONFIG.UNKNOWN_COUNTERPARTY_WEIGHT,
    };
  }

  return {
    behavior:
      "NEUTRAL",

    evidenceWeight: 0,
  };
}

/* =========================================================
   ASSET MAP
========================================================= */

function getAssetAccumulator(
  assets: Map<
    string,
    AssetAccumulator
  >,
  symbol: string
): AssetAccumulator {
  const normalized =
    normalizeSymbol(
      symbol
    );

  let asset =
    assets.get(
      normalized
    );

  if (!asset) {
    asset = {
      symbol:
        normalized,

      inflowUsd:
        0,

      outflowUsd:
        0,

      accumulationUsd:
        0,

      distributionUsd:
        0,

      positioningUsd:
        0,

      rotationUsd:
        0,

      deRiskingUsd:
        0,

      directionalEvidenceUsd:
        0,

      largeTransactions:
        0,

      strongTransactions:
        0,

      transferCount:
        0,

      smartWalletAddresses:
        new Set<string>(),

      walletConfidenceByAddress:
        new Map<
          string,
          number
        >(),

      drivers:
        new Set<string>(),
    };

    assets.set(
      normalized,
      asset
    );
  }

  return asset;
}

/* =========================================================
   DRIVER BUILDER
========================================================= */

function addFlowDriver(
  asset: AssetAccumulator,
  behavior: FlowBehavior,
  usd: number,
  evidenceWeight: number
): void {
  if (
    usd <
    CONFIG.LARGE_TRANSACTION_USD
  ) {
    return;
  }

  const strength =
    usd >=
    CONFIG.STRONG_TRANSACTION_USD
      ? "strong"
      : "large";

  const qualified =
    evidenceWeight >= 0.75;

  switch (
    behavior
  ) {
    case "ACCUMULATION":
      asset.drivers.add(
        qualified
          ? `${strength} smart-money accumulation`
          : `${strength} accumulation evidence`
      );
      break;

    case "DISTRIBUTION":
      asset.drivers.add(
        qualified
          ? `${strength} smart-money distribution`
          : `${strength} distribution evidence`
      );
      break;

    case "POSITIONING":
      asset.drivers.add(
        `${strength} smart-money positioning`
      );
      break;

    case "ROTATION":
      asset.drivers.add(
        `${strength} large-wallet rotation`
      );
      break;

    case "DE_RISKING":
      asset.drivers.add(
        qualified
          ? `${strength} smart-money de-risking`
          : `${strength} de-risking evidence`
      );
      break;

    default:
      break;
  }
}

/* =========================================================
   WALLET PARTICIPATION
========================================================= */

function getWalletConfidence(
  asset: AssetAccumulator
): number {
  if (
    !asset.walletConfidenceByAddress.size
  ) {
    return 0;
  }

  let total =
    0;

  for (
    const confidence of
      asset.walletConfidenceByAddress.values()
  ) {
    total +=
      clamp(
        confidence
      );
  }

  return clamp(
    total /
      asset.walletConfidenceByAddress.size
  );
}

/* =========================================================
   ASSET SCORE
========================================================= */

function calculateAssetScore(
  asset: AssetAccumulator
): {
  smartMoneyScore: number;

  accumulationScore: number;

  distributionScore: number;

  direction: SmartMoneyDirection;

  intent: SmartMoneyIntent;

  activity: SmartMoneyActivity;

  confidence: number;

  risk: string;
} {
  const totalFlow =
    asset.inflowUsd +
    asset.outflowUsd;

  if (
    totalFlow <= 0
  ) {
    return {
      smartMoneyScore:
        0,

      accumulationScore:
        0,

      distributionScore:
        0,

      direction:
        "NEUTRAL",

      intent:
        "UNKNOWN",

      activity:
        "LOW",

      confidence:
        0,

      risk:
        "Insufficient smart-money evidence",
    };
  }

  /* =======================================================
     DIRECTIONAL CAPITAL
  ======================================================= */

  const directionalFlow =
    Math.abs(
      asset.accumulationUsd -
      asset.distributionUsd
    );

  const directionalRatio =
    directionalFlow /
    totalFlow;

  /*
   * Rotation is intentionally not treated as strongly
   * directional.
   */
  const effectiveDirectionalFlow =
    directionalFlow +
    (
      asset.positioningUsd *
      0.35
    ) +
    (
      asset.rotationUsd *
      CONFIG.ROTATION_DIRECTIONAL_WEIGHT
    );

  const effectiveDirectionalRatio =
    clamp(
      effectiveDirectionalFlow /
        totalFlow
    );

  /* =======================================================
     ACCUMULATION / DISTRIBUTION
  ======================================================= */

  const accumulationScore =
    clamp(
      (
        asset.accumulationUsd /
        totalFlow
      ) *
      100
    );

  const distributionScore =
    clamp(
      (
        asset.distributionUsd /
        totalFlow
      ) *
      100
    );

  /* =======================================================
     CAPITAL
  ======================================================= */

  const volumeScore =
    clamp(
      (
        totalFlow /
        CONFIG.HIGH_FLOW_USD
      ) *
      100
    );

  /* =======================================================
     TRANSACTION DEPTH
  ======================================================= */

  const transactionScore =
    clamp(
      (
        asset.largeTransactions /
        CONFIG.HIGH_ACTIVITY_TRANSACTIONS
      ) *
      100
    );

  /*
   * Strong transactions provide additional evidence.
   */
  const strongTransactionBonus =
    clamp(
      (
        asset.strongTransactions /
        5
      ) *
      100
    ) *
    0.20;

  const effectiveTransactionScore =
    clamp(
      transactionScore +
      strongTransactionBonus
    );

  /* =======================================================
     WALLET PARTICIPATION
  ======================================================= */

  const walletCount =
    asset.smartWalletAddresses.size;

  const participationScore =
    clamp(
      (
        walletCount /
        10
      ) *
      100
    );

  /* =======================================================
     WALLET CONFIDENCE
  ======================================================= */

  const walletConfidence =
    getWalletConfidence(
      asset
    );

  /* =======================================================
     COMPOSITE SCORE
  ======================================================= */

  const smartMoneyScore =
    clamp(
      volumeScore *
        SCORE_WEIGHTS.capital +

      effectiveDirectionalRatio *
        100 *
        SCORE_WEIGHTS.direction +

      effectiveTransactionScore *
        SCORE_WEIGHTS.transactions +

      participationScore *
        SCORE_WEIGHTS.participation +

      walletConfidence *
        SCORE_WEIGHTS.walletConfidence
    );

    

 /* =======================================================
   DIRECTION
======================================================= */

let direction: SmartMoneyDirection = "NEUTRAL";

/*
 * Direction must be based on meaningful directional
 * evidence, not simply the composite smart-money score.
 *
 * Large smart -> smart transfers are rotation and should
 * not create an accumulation/distribution signal.
 */

const minimumDirectionalCapital =
  Math.max(
    CONFIG.MODERATE_FLOW_USD,
    totalFlow * 0.10
  );

const accumulationCapital =
  asset.accumulationUsd;

const distributionCapital =
  asset.distributionUsd;

const accumulationDominance =
  accumulationCapital >
  0
    ? accumulationCapital /
      Math.max(
        accumulationCapital +
          distributionCapital,
        1
      )
    : 0;

const distributionDominance =
  distributionCapital >
  0
    ? distributionCapital /
      Math.max(
        accumulationCapital +
          distributionCapital,
        1
      )
    : 0;

const hasMeaningfulAccumulation =
  accumulationCapital >=
  minimumDirectionalCapital;

const hasMeaningfulDistribution =
  distributionCapital >=
  minimumDirectionalCapital;

/*
 * Require both:
 *
 * 1. meaningful directional capital
 * 2. clear dominance over the opposite side
 *
 * This prevents a $1.2M unknown -> whale transfer
 * from overpowering $26M+ of whale rotation.
 */

if (
  smartMoneyScore >=
    CONFIG.MIN_SMART_MONEY_SCORE &&
  hasMeaningfulAccumulation &&
  accumulationDominance >= 0.65 &&
  accumulationScore >=
    CONFIG.STRONG_DIRECTIONAL_SCORE &&
  accumulationScore >
    distributionScore +
      CONFIG.DIRECTION_MARGIN
) {
  direction = "ACCUMULATING";
} else if (
  smartMoneyScore >=
    CONFIG.MIN_SMART_MONEY_SCORE &&
  hasMeaningfulDistribution &&
  distributionDominance >= 0.65 &&
  distributionScore >=
    CONFIG.STRONG_DIRECTIONAL_SCORE &&
  distributionScore >
    accumulationScore +
      CONFIG.DIRECTION_MARGIN
) {
  direction = "DISTRIBUTING";
} else {
  direction = "NEUTRAL";
}

const rotationCapital =
  asset.rotationUsd;

const directionalCapital =
  accumulationCapital +
  distributionCapital;

const rotationDominant =
  rotationCapital >
  directionalCapital * 2 &&
  rotationCapital >
  CONFIG.MODERATE_FLOW_USD;

if (rotationDominant) {
  direction = "NEUTRAL";
}

  /* =======================================================
     INTENT
  ======================================================= */

  let intent:
    SmartMoneyIntent =
    "NEUTRAL";

  if (
    direction ===
    "ACCUMULATING"
  ) {
    intent =
      "ACCUMULATION";
  } else if (
    direction ===
    "DISTRIBUTING"
  ) {
    intent =
      "DISTRIBUTION";
  } else if (
    asset.deRiskingUsd >
    Math.max(
      asset.rotationUsd,
      asset.positioningUsd,
      asset.accumulationUsd,
      asset.distributionUsd
    )
  ) {
    intent =
      "DE_RISKING";
  } else if (
    asset.rotationUsd >
    Math.max(
      asset.accumulationUsd,
      asset.distributionUsd,
      asset.positioningUsd
    )
  ) {
    intent =
      "ROTATION";
  } else if (
    asset.positioningUsd >
    0
  ) {
    intent =
      "POSITIONING";
  } else if (
    effectiveDirectionalRatio <
    0.15
  ) {
    intent =
      "NEUTRAL";
  }

  /* =======================================================
     ACTIVITY
  ======================================================= */

  let activity:
    SmartMoneyActivity =
    "LOW";

  if (
    asset.largeTransactions >=
      CONFIG.EXTREME_ACTIVITY_TRANSACTIONS ||
    totalFlow >=
      CONFIG.EXTREME_FLOW_USD
  ) {
    activity =
      "EXTREME";
  } else if (
    asset.largeTransactions >=
      CONFIG.HIGH_ACTIVITY_TRANSACTIONS ||
    totalFlow >=
      CONFIG.HIGH_FLOW_USD
  ) {
    activity =
      "HIGH";
  } else if (
    asset.largeTransactions >=
      CONFIG.MODERATE_ACTIVITY_TRANSACTIONS ||
    totalFlow >=
      CONFIG.MODERATE_FLOW_USD
  ) {
    activity =
      "MODERATE";
  }

  /* =======================================================
     CONFIDENCE
  ======================================================= */

  const participation =
    participationScore;

  const transactionDepth =
    clamp(
      (
        asset.largeTransactions /
        10
      ) *
      100
    );

  const capitalDepth =
    clamp(
      (
        totalFlow /
        CONFIG.HIGH_FLOW_USD
      ) *
      100
    );

  /*
   * Evidence quality.
   */
  const directionalEvidence =
    clamp(
      directionalRatio *
      100
    );

  const confidence =
    clamp(
      participation *
        0.25 +

      transactionDepth *
        0.20 +

      capitalDepth *
        0.15 +

      walletConfidence *
        0.20 +

      directionalEvidence *
        0.20
    );

  /* =======================================================
     RISK
  ======================================================= */

  let risk =
    "Limited directional evidence";

  if (
    direction ===
    "ACCUMULATING"
  ) {
    risk =
      confidence >= 70
        ? "Accumulation signal has meaningful confirmation"
        : "Accumulation signal needs more confirmation";
  } else if (
    direction ===
    "DISTRIBUTING"
  ) {
    risk =
      confidence >= 70
        ? "Distribution signal has meaningful confirmation"
        : "Distribution signal needs more confirmation";
  } else if (
    intent ===
    "ROTATION"
  ) {
    risk =
      "Capital is moving between large wallets without clear directional conviction";
  } else if (
    intent ===
    "DE_RISKING"
  ) {
    risk =
      "Wallet activity suggests capital is moving away from risk";
  } else if (
    intent ===
    "POSITIONING"
  ) {
    risk =
      "Large-wallet positioning is visible, but directional conviction is not yet decisive";
  } else if (
    activity ===
    "EXTREME"
  ) {
    risk =
      "Very high activity may represent repositioning or rotation";
  }

  /* =======================================================
     WEAK SIGNAL PROTECTION
  ======================================================= */

  if (
    smartMoneyScore <
    CONFIG.MIN_SMART_MONEY_SCORE
  ) {
    direction =
      "NEUTRAL";

    intent =
      "NEUTRAL";

    risk =
      "Insufficient smart-money evidence";
  }

  return {
    smartMoneyScore:
      round(
        smartMoneyScore
      ),

    accumulationScore:
      round(
        accumulationScore
      ),

    distributionScore:
      round(
        distributionScore
      ),

    direction,

    intent,

    activity,

    confidence:
      round(
        confidence
      ),

    risk,
  };
}

/* =========================================================
   BUILD SMART MONEY ASSETS
========================================================= */

function buildSmartMoneyAssets(
  transfers: SmartMoneyTransfer[],
  wallets: SmartWalletCandidate[]
): SmartMoneyAsset[] {
  const walletsByAddress =
    new Map<
      string,
      SmartWalletCandidate
    >();

  for (
    const wallet of wallets
  ) {
    const address =
      normalizeAddress(
        wallet.address
      );

    if (!address) {
      continue;
    }

    walletsByAddress.set(
      address,
      wallet
    );
  }

  const assets =
    new Map<
      string,
      AssetAccumulator
    >();

  for (
    const transfer of transfers
  ) {
    const usd =
      getTransferUsdValue(
        transfer
      );

    /*
     * Never infer USD value.
     */
    if (
      usd <
      CONFIG.MIN_TRANSFER_USD
    ) {
      continue;
    }

    const fromAddress =
      normalizeAddress(
        transfer.fromAddress
      );

    const toAddress =
      normalizeAddress(
        transfer.toAddress
      );

    if (
      !fromAddress &&
      !toAddress
    ) {
      continue;
    }

    const behaviorResult =
      inferTransferBehavior(
        transfer,
        walletsByAddress
      );

    if (
      behaviorResult.evidenceWeight <=
      0
    ) {
      continue;
    }

    const fromRole =
      getAddressRole(
        fromAddress,
        walletsByAddress
      );

    const toRole =
      getAddressRole(
        toAddress,
        walletsByAddress
      );

    const smartFrom =
      isQualifiedSmartRole(
        fromRole
      );

    const smartTo =
      isQualifiedSmartRole(
        toRole
      );

    if (
      !smartFrom &&
      !smartTo
    ) {
      continue;
    }

    const asset =
      getAssetAccumulator(
        assets,
        transfer.tokenSymbol
      );

    asset.transferCount +=
      1;

    const weightedUsd =
      usd *
      behaviorResult.evidenceWeight;

    /* =====================================================
       RAW SMART WALLET FLOW
    ===================================================== */

    if (
      smartTo
    ) {
      asset.inflowUsd +=
        usd;
    }

    if (
      smartFrom
    ) {
      asset.outflowUsd +=
        usd;
    }

    /* =====================================================
       BEHAVIOR
    ===================================================== */

    switch (
      behaviorResult.behavior
    ) {
      case "ACCUMULATION":
        asset.accumulationUsd +=
          weightedUsd;

        asset.directionalEvidenceUsd +=
          weightedUsd;

        break;

      case "DISTRIBUTION":
        asset.distributionUsd +=
          weightedUsd;

        asset.directionalEvidenceUsd +=
          weightedUsd;

        break;

      case "POSITIONING":
        asset.positioningUsd +=
          weightedUsd;

        break;

      case "ROTATION":
        asset.rotationUsd +=
          weightedUsd;

        break;

      case "DE_RISKING":
        asset.deRiskingUsd +=
          weightedUsd;

        asset.directionalEvidenceUsd +=
          weightedUsd;

        break;

      default:
        break;
    }

    /* =====================================================
       TRANSACTION SIZE
    ===================================================== */

    if (
      usd >=
      CONFIG.LARGE_TRANSACTION_USD
    ) {
      asset.largeTransactions +=
        1;
    }

    if (
      usd >=
      CONFIG.STRONG_TRANSACTION_USD
    ) {
      asset.strongTransactions +=
        1;
    }

    /* =====================================================
       UNIQUE SMART WALLETS
    ===================================================== */

    const relevantAddresses =
      new Set<string>();

    if (
      smartFrom &&
      fromAddress
    ) {
      relevantAddresses.add(
        fromAddress
      );
    }

    if (
      smartTo &&
      toAddress
    ) {
      relevantAddresses.add(
        toAddress
      );
    }

    for (
      const address of
        relevantAddresses
    ) {
      asset.smartWalletAddresses.add(
        address
      );

      const wallet =
        walletsByAddress.get(
          address
        );

      if (!wallet) {
        continue;
      }

      /*
       * Keep one confidence value per wallet.
       *
       * This prevents a highly active wallet from
       * artificially inflating confidence simply by
       * appearing in many transfers.
       */
      const existing =
        asset.walletConfidenceByAddress.get(
          address
        );

      const confidence =
        clamp(
          safeNumber(
            wallet.confidence
          )
        );

      if (
        existing === undefined ||
        confidence > existing
      ) {
        asset.walletConfidenceByAddress.set(
          address,
          confidence
        );
      }
    }

    addFlowDriver(
      asset,
      behaviorResult.behavior,
      usd,
      behaviorResult.evidenceWeight
    );
  }

  return Array.from(
    assets.values()
  )
    .map(
      (asset) => {
        const scored =
          calculateAssetScore(
            asset
          );

        return {
          symbol:
            asset.symbol,

          direction:
            scored.direction,

          intent:
            scored.intent,

          activity:
            scored.activity,

          smartMoneyScore:
            scored.smartMoneyScore,

          confidence:
            scored.confidence,

          flow: {
            inflow:
              round(
                asset.inflowUsd
              ),

            outflow:
              round(
                asset.outflowUsd
              ),

            netFlow:
              round(
                asset.inflowUsd -
                asset.outflowUsd
              ),
          },

          largeTransactions:
            asset.largeTransactions,

          accumulationScore:
            scored.accumulationScore,

          distributionScore:
            scored.distributionScore,

          drivers:
            Array.from(
              asset.drivers
            )
              .slice(
                0,
                CONFIG.MAX_DRIVERS
              ),

          risk:
            scored.risk,

          updatedAt:
            Date.now(),
        };
      }
    )
    /*
     * Ignore extremely weak assets.
     */
    .filter(
      (asset) =>
        asset.smartMoneyScore >=
          CONFIG.MIN_SMART_MONEY_SCORE ||
        asset.largeTransactions > 0
    )
    .sort(
      (a, b) =>
        b.smartMoneyScore -
        a.smartMoneyScore
    )
    .slice(
      0,
      CONFIG.MAX_ASSETS
    );
}

/* =========================================================
   OVERALL DIRECTION
========================================================= */

function calculateOverallDirection(
  assets: SmartMoneyAsset[]
): SmartMoneyDirection {
  if (!assets.length) {
    return "NEUTRAL";
  }

  let accumulationWeight = 0;
  let distributionWeight = 0;

  for (const asset of assets) {
    const confidence =
      clamp(asset.confidence) / 100;

    const score =
      clamp(asset.smartMoneyScore) / 100;

    const totalCapital =
      Math.max(
        asset.flow.inflow +
          asset.flow.outflow,
        1
      );

    /*
     * Only assets with an actual directional classification
     * participate in the market directional signal.
     *
     * Neutral / rotation assets do not vote bullish or bearish.
     */
    if (
      asset.direction !==
      "ACCUMULATING" &&
      asset.direction !==
      "DISTRIBUTING"
    ) {
      continue;
    }

    /*
     * Diminishing-return capital weighting.
     */
    const capitalWeight =
      Math.log10(
        totalCapital + 10
      );

    const weight =
      confidence *
      score *
      capitalWeight;

    if (
      asset.direction ===
      "ACCUMULATING"
    ) {
      accumulationWeight +=
        weight *
        Math.max(
          asset.accumulationScore,
          0
        );
    }

    if (
      asset.direction ===
      "DISTRIBUTING"
    ) {
      distributionWeight +=
        weight *
        Math.max(
          asset.distributionScore,
          0
        );
    }
  }

  /*
   * No genuinely directional assets.
   */
  if (
    accumulationWeight <= 0 &&
    distributionWeight <= 0
  ) {
    return "NEUTRAL";
  }

  /*
   * Require a meaningful imbalance.
   */
  if (
    accumulationWeight >
    distributionWeight *
      CONFIG.OVERALL_DIRECTION_MARGIN
  ) {
    return "ACCUMULATING";
  }

  if (
    distributionWeight >
    accumulationWeight *
      CONFIG.OVERALL_DIRECTION_MARGIN
  ) {
    return "DISTRIBUTING";
  }

  return "NEUTRAL";
}

/* =========================================================
   OVERALL SCORE
========================================================= */

function calculateOverallScore(
  assets: SmartMoneyAsset[]
): number {
  if (
    !assets.length
  ) {
    return 0;
  }

  let weightedScore =
    0;

  let totalWeight =
    0;

  for (
    const asset of assets
  ) {
    const confidence =
      clamp(
        asset.confidence
      ) /
      100;

    const capital =
      Math.max(
        asset.flow.inflow +
        asset.flow.outflow,
        1
      );

    /*
     * Diminishing-return capital weight.
     */
    const capitalWeight =
      Math.log10(
        capital + 10
      );

    const weight =
      Math.max(
        confidence *
        capitalWeight,
        0.01
      );

    weightedScore +=
      asset.smartMoneyScore *
      weight;

    totalWeight +=
      weight;
  }

  if (
    totalWeight <= 0
  ) {
    return 0;
  }

  return round(
    clamp(
      weightedScore /
      totalWeight
    )
  );
}

/* =========================================================
   OVERALL CONFIDENCE
========================================================= */

function calculateOverallConfidence(
  assets: SmartMoneyAsset[],
  wallets: SmartWalletCandidate[]
): number {
  if (
    !assets.length
  ) {
    return 0;
  }

  const assetConfidence =
    assets.reduce(
      (
        total,
        asset
      ) =>
        total +
        asset.confidence,
      0
    ) /
    assets.length;

  const qualifiedWallets =
    wallets.filter(
      (wallet) =>
        wallet.preliminarySmartMoneyScore >=
        CONFIG.MIN_SMART_MONEY_SCORE
    );

  const uniqueChains =
    new Set(
      qualifiedWallets.map(
        (wallet) =>
          wallet.chain
      )
    ).size;

  const walletParticipation =
    clamp(
      (
        qualifiedWallets.length /
        10
      ) *
      100
    );

  /*
   * Cross-chain participation is a small bonus,
   * not a primary signal.
   */
  const chainDiversityBonus =
    clamp(
      uniqueChains *
      5
    );

  return round(
    clamp(
      assetConfidence *
        0.70 +

      walletParticipation *
        0.20 +

      chainDiversityBonus *
        0.10
    )
  );
}

/* =========================================================
   KEY DRIVERS
========================================================= */

function buildKeyDrivers(
  assets: SmartMoneyAsset[],
  direction: SmartMoneyDirection
): string[] {
  const drivers:
    string[] =
    [];

  const strongestAccumulation =
    [...assets]
      .filter(
        (asset) =>
          asset.direction ===
          "ACCUMULATING"
      )
      .sort(
        (a, b) =>
          (
            b.smartMoneyScore *
            b.confidence
          ) -
          (
            a.smartMoneyScore *
            a.confidence
          )
      )[0];

  const strongestDistribution =
    [...assets]
      .filter(
        (asset) =>
          asset.direction ===
          "DISTRIBUTING"
      )
      .sort(
        (a, b) =>
          (
            b.smartMoneyScore *
            b.confidence
          ) -
          (
            a.smartMoneyScore *
            a.confidence
          )
      )[0];

  if (
    strongestAccumulation
  ) {
    drivers.push(
      `${strongestAccumulation.symbol} shows smart-money accumulation`
    );
  }

  if (
    strongestDistribution
  ) {
    drivers.push(
      `${strongestDistribution.symbol} shows smart-money distribution`
    );
  }

  const rotationAssets =
    assets.filter(
      (asset) =>
        asset.intent ===
        "ROTATION"
    );

  if (
    rotationAssets.length
  ) {
    drivers.push(
      `Wallet rotation detected across ${rotationAssets.length} asset${
        rotationAssets.length === 1
          ? ""
          : "s"
      }`
    );
  }

  const positioningAssets =
    assets.filter(
      (asset) =>
        asset.intent ===
        "POSITIONING"
    );

  if (
    positioningAssets.length
  ) {
    drivers.push(
      `Smart wallets show positioning activity in ${positioningAssets.length} asset${
        positioningAssets.length === 1
          ? ""
          : "s"
      }`
    );
  }

  const deRiskingAssets =
    assets.filter(
      (asset) =>
        asset.intent ===
        "DE_RISKING"
    );

  if (
    deRiskingAssets.length
  ) {
    drivers.push(
      `De-risking activity detected across ${deRiskingAssets.length} asset${
        deRiskingAssets.length === 1
          ? ""
          : "s"
      }`
    );
  }

  const highActivityAssets =
    assets.filter(
      (asset) =>
        asset.activity ===
          "HIGH" ||
        asset.activity ===
          "EXTREME"
    );

  if (
    highActivityAssets.length
  ) {
    drivers.push(
      `Elevated large-wallet activity across ${highActivityAssets.length} asset${
        highActivityAssets.length === 1
          ? ""
          : "s"
      }`
    );
  }

  if (
    direction ===
    "NEUTRAL"
  ) {
    drivers.push(
      "Smart-money flows remain mixed without a dominant directional bias"
    );
  }

  return [
    ...new Set(
      drivers
    ),
  ].slice(
    0,
    CONFIG.MAX_DRIVERS
  );
}

/* =========================================================
   EMPTY OUTPUT
========================================================= */

function emptySmartMoneyOutput(
  message =
    "No smart-money transfer data available"
): SmartMoneyOutput {
  return {
    assets: [],

    overallDirection:
      "NEUTRAL",

    overallScore:
      0,

    overallConfidence:
      0,

    keyDrivers: [
      message,
    ],

    generatedAt:
      Date.now(),
  };
}

/* =========================================================
   MAIN ENGINE
========================================================= */

export function buildSmartMoneyOutput(
  transfers: SmartMoneyTransfer[]
): SmartMoneyOutput {
  if (
    !Array.isArray(
      transfers
    ) ||
    !transfers.length
  ) {
    return emptySmartMoneyOutput();
  }

  /*
   * Remove malformed / duplicate records before
   * discovery and scoring.
   */
  const cleanTransfers =
    deduplicateTransfers(
      transfers
    );

  if (
    !cleanTransfers.length
  ) {
    return emptySmartMoneyOutput(
      "No valid smart-money transfer data available"
    );
  }

  /* =======================================================
     STAGE 1
     Discover meaningful wallets.
  ======================================================= */

  const wallets =
    discoverSmartWallets(
      cleanTransfers
    );

  if (
    !wallets.length
  ) {
    return emptySmartMoneyOutput(
      "No qualified smart-money wallets identified"
    );
  }

  /* =======================================================
     STAGE 2
     Convert wallet behavior into asset signals.
  ======================================================= */

  const assets =
    buildSmartMoneyAssets(
      cleanTransfers,
      wallets
    );

  if (
    !assets.length
  ) {
    return emptySmartMoneyOutput(
      "No meaningful smart-money asset activity identified"
    );
  }

  /* =======================================================
     STAGE 3
     Market-level signal.
  ======================================================= */

  const overallDirection =
    calculateOverallDirection(
      assets
    );

  const overallScore =
    calculateOverallScore(
      assets
    );

  const overallConfidence =
    calculateOverallConfidence(
      assets,
      wallets
    );

  const keyDrivers =
    buildKeyDrivers(
      assets,
      overallDirection
    );

  return {
    assets,

    overallDirection,

    overallScore,

    overallConfidence,

    keyDrivers,

    generatedAt:
      Date.now(),
  };
}

/* =========================================================
   PUBLIC ALIAS
========================================================= */

export const analyzeSmartMoney =
  buildSmartMoneyOutput;
