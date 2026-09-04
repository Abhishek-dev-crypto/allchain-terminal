import "server-only";

import { redis } from "@/lib/redis";

const LOCK_PREFIX = "lock:market:";
const DEFAULT_LOCK_TTL = 10;

type LockResult = {
  acquired: boolean;
  token: string;
};

export async function acquireLock(
  key: string,
  ttlSeconds = DEFAULT_LOCK_TTL
): Promise<LockResult> {
  const lockKey = `${LOCK_PREFIX}${key}`;

  const token =
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  try {
    const result = await redis.set(
      lockKey,
      token,
      {
        nx: true,
        ex: ttlSeconds,
      }
    );

    return {
      acquired: result === "OK",
      token,
    };
  } catch (error) {
    console.error(
      `Redis LOCK failed: ${lockKey}`,
      error
    );

    return {
      acquired: false,
      token,
    };
  }
}

export async function releaseLock(
  key: string,
  token: string
): Promise<void> {
  const lockKey = `${LOCK_PREFIX}${key}`;

  try {
    const currentToken = await redis.get<string>(
      lockKey
    );

    if (currentToken !== token) {
      return;
    }

    await redis.del(lockKey);
  } catch (error) {
    console.error(
      `Redis UNLOCK failed: ${lockKey}`,
      error
    );
  }
}