type MemoryEntry<T> = {
  data: T;
  expiresAt: number;
};

const memoryCache = new Map<
  string,
  MemoryEntry<unknown>
>();

export function getMemoryCache<T>(
  key: string
): T | null {
  const entry = memoryCache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data as T;
}

export function setMemoryCache<T>(
  key: string,
  data: T,
  ttlSeconds: number
) {
  memoryCache.set(key, {
    data,
    expiresAt:
      Date.now() + ttlSeconds * 1000,
  });
}

export function deleteMemoryCache(
  key: string
) {
  memoryCache.delete(key);
}

export function clearMemoryCache() {
  memoryCache.clear();
}