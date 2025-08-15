interface CacheEntry<T> {
  data: T;
  expires: number;
}

const CACHE_PREFIX = 'filmique-cache-';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL) {
  if (typeof key !== 'string' || !key) return;
  try {
    const entry: CacheEntry<T> = {
      data,
      expires: Date.now() + ttl,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (e) {
    console.error("Failed to write to cache:", e);
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const rawEntry = localStorage.getItem(CACHE_PREFIX + key);
    if (!rawEntry) return null;

    const entry: CacheEntry<T> = JSON.parse(rawEntry);
    if (Date.now() > entry.expires) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch (e) {
    console.error("Failed to read from cache:", e);
    return null;
  }
}

export function invalidateCache(key: string | string[]) {
  const keys = Array.isArray(key) ? key : [key];
  for (const k of keys) {
    localStorage.removeItem(CACHE_PREFIX + k);
  }
}

export function clearCache() {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error("Failed to clear cache:", e);
  }
}