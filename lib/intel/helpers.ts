// /lib/intel/helpers.ts

// ===============================
// CLAMP UTILITY
// ===============================
export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// ===============================
// VOLATILITY CLASSIFICATION
// ===============================
export function classifyVolatility(volatility: number) {
  if (volatility < 2) return "LOW";
  if (volatility < 5) return "NORMAL";
  if (volatility < 8) return "ELEVATED";
  return "EXTREME";
}

// ===============================
// BREADTH CLASSIFICATION
// ===============================
export function classifyBreadth(positiveBreadth: number) {
  if (positiveBreadth > 70) return "STRONG";
  if (positiveBreadth < 35) return "WEAK";
  return "NARROW";
}

// ===============================
// STABILITY CLASSIFICATION
// ===============================
export function classifyStability(
  volatility: number,
  negativeBreadth: number
) {
  if (volatility > 7 && negativeBreadth > 70) {
    return "UNSTABLE";
  }

  if (volatility > 4) {
    return "FRAGILE";
  }

  return "STABLE";
}

// ===============================
// DISPERSION CALCULATION
// ===============================
export function calculateDispersion(values: number[]) {
  if (!values.length) return 0;

  const max = Math.max(...values);
  const min = Math.min(...values);

  return max - min;
}

// ===============================
// MOMENTUM SCORE HELPERS (OPTIONAL BUT CLEAN)
// ===============================
export function calculateMomentumScore(avgFlow: number) {
  return clamp(avgFlow * 20 + 50, 0, 100);
}

// ===============================
// VOLATILITY SCORE HELPER
// ===============================
export function calculateVolatilityScore(volatility: number) {
  return clamp(100 - volatility * 10, 0, 100);
}