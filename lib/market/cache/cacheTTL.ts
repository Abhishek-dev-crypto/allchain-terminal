/**
 * Adds random TTL jitter to avoid synchronized expiry.
 * Ensures at least 1 second of variation for very short TTLs.
 */

export function withJitter(
  ttl: number,
  jitter = 0.3
): number {
  const maxExtra = Math.max(1, Math.ceil(ttl * jitter));

  return ttl + Math.floor(Math.random() * (maxExtra + 1));
}