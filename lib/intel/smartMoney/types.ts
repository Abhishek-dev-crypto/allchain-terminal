
import "server-only";

/* =========================================================
   SMART MONEY TYPES
========================================================= */

/**
 * Market-level directional interpretation.
 *
 * IMPORTANT:
 * This represents inferred smart-money behavior,
 * not guaranteed future price direction.
 */
export type SmartMoneyDirection =
  | "ACCUMULATING"
  | "DISTRIBUTING"
  | "NEUTRAL";

/**
 * Behavioral interpretation of smart-money activity.
 */
export type SmartMoneyIntent =
  | "ACCUMULATION"
  | "DISTRIBUTION"
  | "POSITIONING"
  | "ROTATION"
  | "DE_RISKING"
  | "NEUTRAL"
  | "UNKNOWN";

/**
 * Activity intensity.
 */
export type SmartMoneyActivity =
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "EXTREME";

/* =========================================================
   WALLET CLASSIFICATION
========================================================= */

/**
 * Classification of a wallet based on observable behavior.
 *
 * These are behavioral classifications.
 * They are NOT claims about the identity of the wallet owner.
 */
export type SmartWalletClassification =
  | "WHALE"
  | "SMART"
  | "INSTITUTIONAL_LIKE"
  | "EXCHANGE"
  | "PROTOCOL"
  | "UNKNOWN";

/* =========================================================
   TRANSFER
========================================================= */

export type SmartMoneyTransfer = {
  /**
   * Normalized chain identifier.
   *
   * Examples:
   * 0x1
   * 0x89
   * 0x38
   * 0xa4b1
   * 0x2105
   */
  chain: string;

  /**
   * Blockchain transaction hash.
   */
  transactionHash: string;

  /**
   * Sender address.
   */
  fromAddress: string;

  /**
   * Receiver address.
   */
  toAddress: string;

  /**
   * Token ticker.
   */
  tokenSymbol: string;

  /**
   * Token contract address.
   *
   * Undefined for native assets.
   */
  tokenAddress?: string;

  /**
   * Human-readable token amount.
   *
   * Example:
   * 139.41227 XAUt
   */
  value: number;

  /**
   * USD value supplied by the data provider.
   *
   * This MUST NOT be inferred by the Smart Money engine
   * when unavailable.
   */
  valueUsd?: number;

  /**
   * Block timestamp in milliseconds.
   */
  timestamp: number;

  /**
   * Optional provider-resolved sender label.
   */
  fromLabel?: string;

  /**
   * Optional provider-resolved receiver label.
   */
  toLabel?: string;
};

/* =========================================================
   FLOW
========================================================= */

export type SmartMoneyFlow = {
  /**
   * Capital entering qualified smart-money wallets.
   */
  inflow: number;

  /**
   * Capital leaving qualified smart-money wallets.
   */
  outflow: number;

  /**
   * Net smart-money flow.
   *
   * inflow - outflow
   */
  netFlow: number;
};

/* =========================================================
   WALLET CANDIDATE
========================================================= */

/**
 * A wallet discovered by walletDiscovery.ts.
 *
 * This represents a candidate based on observable
 * transaction behavior.
 *
 * It does NOT prove that the wallet belongs to:
 * - an institution
 * - a professional trader
 * - a fund
 * - a market maker
 * - or any particular individual/entity.
 */
export type SmartWalletCandidate = {
  /**
   * Wallet address.
   */
  address: string;

  /**
   * Chain where the behavior was observed.
   */
  chain: string;

  /**
   * Behavioral classification.
   */
  classification: SmartWalletClassification;

  /**
   * Number of qualifying transfers observed.
   */
  transactionCount: number;

  /**
   * Aggregate USD value of qualifying transfers.
   */
  totalVolumeUsd: number;

  /**
   * USD value received.
   */
  inflowUsd: number;

  /**
   * USD value sent.
   */
  outflowUsd: number;

  /**
   * inflowUsd - outflowUsd.
   */
  netFlowUsd: number;

  /**
   * Assets observed.
   */
  assets: string[];

  /**
   * Number of unique assets.
   */
  uniqueAssets: number;

  /**
   * Average qualifying transaction size.
   */
  averageTransactionUsd: number;

  /**
   * Largest qualifying transaction.
   */
  largestTransactionUsd: number;

  /**
   * First observed qualifying activity.
   */
  firstSeen: number;

  /**
   * Most recent observed qualifying activity.
   */
  lastSeen: number;

  /**
   * Activity intensity score, 0-100.
   */
  activityScore: number;

  /**
   * Preliminary wallet-quality score, 0-100.
   *
   * This is used by the discovery layer.
   * It is NOT the final asset-level Smart Money score.
   */
  preliminarySmartMoneyScore: number;

  /**
   * Discovery confidence, 0-100.
   */
  confidence: number;

  /**
   * Human-readable behavioral labels.
   */
  labels: string[];

  /**
   * Timestamp when this candidate was generated.
   */
  updatedAt: number;
};

/* =========================================================
   ASSET
========================================================= */

/**
 * Asset-level Smart Money intelligence.
 */
export type SmartMoneyAsset = {
  /**
   * Asset ticker.
   */
  symbol: string;

  /**
   * Direction inferred from smart-money behavior.
   */
  direction: SmartMoneyDirection;

  /**
   * Dominant behavioral intent.
   */
  intent: SmartMoneyIntent;

  /**
   * Activity intensity.
   */
  activity: SmartMoneyActivity;

  /**
   * Composite asset-level Smart Money score.
   *
   * Range: 0-100.
   */
  smartMoneyScore: number;

  /**
   * Confidence in the asset-level inference.
   *
   * Range: 0-100.
   */
  confidence: number;

  /**
   * Smart-money flow metrics.
   */
  flow: SmartMoneyFlow;

  /**
   * Number of qualifying large transactions.
   */
  largeTransactions: number;

  /**
   * Accumulation evidence score.
   *
   * Range: 0-100.
   */
  accumulationScore: number;

  /**
   * Distribution evidence score.
   *
   * Range: 0-100.
   */
  distributionScore: number;

  /**
   * Human-readable evidence drivers.
   */
  drivers: string[];

  /**
   * Risk / uncertainty explanation.
   */
  risk: string;

  /**
   * Number of independent qualified wallets
   * contributing to the asset signal.
   */
  smartWalletCount?: number;

  /**
   * Total USD volume contributed by qualified wallets.
   */
  smartWalletVolumeUsd?: number;

  /**
   * Number of observed transfer records used.
   */
  transferCount?: number;

  /**
   * Timestamp when the asset signal was generated.
   */
  updatedAt: number;
};

/* =========================================================
   OUTPUT
========================================================= */

/**
 * Complete Smart Money intelligence output.
 */
export type SmartMoneyOutput = {
  /**
   * Asset-level signals.
   */
  assets: SmartMoneyAsset[];

  /**
   * Market-wide smart-money direction.
   */
  overallDirection: SmartMoneyDirection;

  /**
   * Market-wide Smart Money strength.
   *
   * Range: 0-100.
   */
  overallScore: number;

  /**
   * Market-wide confidence.
   *
   * Range: 0-100.
   */
  overallConfidence: number;

  /**
   * Most important observable drivers.
   */
  keyDrivers: string[];

  /**
   * Generation timestamp.
   */
  generatedAt: number;
};
