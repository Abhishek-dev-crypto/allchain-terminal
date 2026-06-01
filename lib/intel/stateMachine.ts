export function detectMarketTransition({
  currentRegime,
  previousRegime,
  volatility,
  participation,
}: {
  currentRegime: string;
  previousRegime: string;
  volatility: number;
  participation: number;
}) {
  if (
    previousRegime === "RISK_OFF" &&
    currentRegime === "RISK_ON"
  ) {
    return "RECOVERY";
  }

  if (
    volatility > 7 &&
    participation < 30
  ) {
    return "PANIC";
  }

  if (
    volatility < 3 &&
    participation > 65
  ) {
    return "ACCUMULATION";
  }

  return "STABLE";
}