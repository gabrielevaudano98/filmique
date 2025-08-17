import { Preferences } from '@capacitor/preferences';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export async function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL) {
  if (typeof key !== 'string' || !key) return;
  const entry: CacheEntry<T> = { data, timestamp: Date.now() + ttl };
  try {
    await Preferences.set({
      key: `filmique_cache_${key}`,
      value: JSON.stringify(entry),
    });
  } catch (e) {
    console.error(`Failed to set cache for key: ${key}`, e);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const { value } = await Preferences.get({ key: `filmique_cache_${key}` });
  if (!value) {
    return null;
  }

  try {
    const entry: CacheEntry<T> = JSON.parse(value);
    const isExpired = Date.now() > entry.timestamp;
    if (isExpired) {
      await invalidateCache(key);
      return null;
    }
    return entry.data;
  } catch (e) {
    console.error(`Failed to parse cache for key: ${key}`, e);
    return null;
  }
}

export async function invalidateCache(key: string | string[]) {
  const keys = Array.isArray(key) ? key : [key];
  for (const k of keys) {
    await Preferences.remove({ key: `filmique_cache_${k}` });
  }
}

export async function clearCache() {
  const { keys } = await Preferences.keys();
  const cacheKeys = keys.filter(k => k.startsWith('filmique_cache_'));
  for (const key of cacheKeys) {
    await Preferences.remove({ key });
  }
}