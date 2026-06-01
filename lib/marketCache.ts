import { redis } from "@/lib/redis";

const CACHE_TTL = 5; // seconds (for trading data)

export async function getCache(key: string) {
  if (typeof window !== "undefined") return null;
  return redis.get(key);
}

export async function setCache(key: string, value: any, ttl = 5) {
  if (typeof window !== "undefined") return;
  return redis.set(key, value, { ex: ttl });
}