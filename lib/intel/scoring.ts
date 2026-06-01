// /lib/intel/scoring.ts

export function calculateMomentumScore(
  momentum: number
) {
  return clamp(momentum * 10, 0, 100);
}

export function calculateVolatilityScore(
  volatility: number
) {
  return clamp(100 - volatility * 10, 0, 100);
}

export function calculateParticipationScore(
  breadth: number,
  sectorStrength: number,
  momentumAlignment: number
) {
  return clamp(
    breadth * 0.4 +
    sectorStrength * 0.3 +
    momentumAlignment * 0.3,
    0,
    100
  );
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}

export function calculateRegimeConfidence({
  participationScore,
  volatilityScore,
  breadthScore,
  momentumScore,
}: {
  participationScore: number;
  volatilityScore: number;
  breadthScore: number;
  momentumScore: number;
}) {
  return clamp(
    participationScore * 0.3 +
      volatilityScore * 0.2 +
      breadthScore * 0.3 +
      momentumScore * 0.2,
    0,
    100
  );
}

export function calculateMarketHealth({
  momentumScore,
  breadthScore,
  participationScore,
  volatilityScore,
}: {
  momentumScore: number;
  breadthScore: number;
  participationScore: number;
  volatilityScore: number;
}) {
  return clamp(
    momentumScore * 0.3 +
      breadthScore * 0.3 +
      participationScore * 0.25 +
      volatilityScore * 0.15,
    0,
    100
  );
}