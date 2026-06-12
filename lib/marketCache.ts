import "server-only";

import { redis } from "@/lib/redis";

export async function getCache(key: string) {
  try {
    return await redis.get(key);
  } catch (err) {
    console.error("Redis GET Error:", err);
    return null;
  }
}

export async function setCache(
  key: string,
  value: any,
  ttl = 5
) {
  try {
    await redis.set(key, value, {
      ex: ttl,
    });
  } catch (err) {
    console.error("Redis SET Error:", err);
  }
}