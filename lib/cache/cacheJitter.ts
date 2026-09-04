export function withJitter(
  ttlSeconds: number,
  percentage = 0.2
): number {
  if (ttlSeconds <= 0) {
    return 1;
  }

  const variation = ttlSeconds * percentage;

  const min = ttlSeconds - variation;
  const max = ttlSeconds + variation;

  return Math.max(
    1,
    Math.round(
      min + Math.random() * (max - min)
    )
  );
}