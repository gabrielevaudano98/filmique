interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = 3 * 60 * 1000; // 3 minutes

export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL) {
  if (typeof key !== 'string' || !key) return;
  cache.set(key, { data, timestamp: Date.now() + ttl });
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  const isExpired = Date.now() > entry.timestamp;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

export function invalidateCache(key: string | string[]) {
  const keys = Array.isArray(key) ? key : [key];
  for (const k of keys) {
    cache.delete(k);
  }
}

export function clearCache() {
  cache.clear();
}