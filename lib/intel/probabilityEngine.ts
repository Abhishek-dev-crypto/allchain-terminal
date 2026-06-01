export function generateMarketProbabilities({
  volatility,
  participation,
  momentum,
}: {
  volatility: number;
  participation: number;
  momentum: number;
}) {
  const recovery =
    participation * 0.5 +
    (100 - volatility) * 0.3 +
    momentum * 0.2;

  const breakdown =
    volatility * 0.5 +
    (100 - participation) * 0.3 +
    (100 - momentum) * 0.2;

  return {
    recovery: Math.round(recovery),
    breakdown: Math.round(breakdown),
  };
}