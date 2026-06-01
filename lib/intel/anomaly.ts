export function detectAnomaly({
  volatility,
  breadth,
  participation,
}: {
  volatility: number;
  breadth: number;
  participation: number;
}) {
  if (
    volatility > 8 &&
    breadth > 70
  ) {
    return "UNUSUAL_STRENGTH";
  }

  if (
    volatility < 2 &&
    participation < 20
  ) {
    return "COMPRESSION";
  }

  return null;
}