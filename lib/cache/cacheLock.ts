import "server-only";

import { redis } from "@/lib/redis";

const LOCK_TTL = 15;

function lockKey(key: string) {
  return `lock:${key}`;
}

export async function acquireCacheLock(
  key: string
): Promise<boolean> {
  try {
    const result = await redis.set(
      lockKey(key),
      Date.now().toString(),
      {
        nx: true,
        ex: LOCK_TTL,
      }
    );

    return result === "OK";
  } catch (error) {
    console.error(
      `Redis LOCK failed: ${key}`,
      error
    );

    return false;
  }
}

export async function releaseCacheLock(
  key: string
) {
  try {
    await redis.del(lockKey(key));
  } catch (error) {
    console.error(
      `Redis UNLOCK failed: ${key}`,
      error
    );
  }
}