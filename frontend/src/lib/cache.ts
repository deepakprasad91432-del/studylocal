/**
 * Cache utility — wraps Redis with get/set/del helpers.
 * Falls back to no-op if Redis is unavailable or errors out.
 */
import getRedisClient from './redis';

/** Truly fail-silent cache GET */
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const redis = getRedisClient();
        if (!redis) return null;

        // Force a check on the client status to avoid errors from broken connections
        if (redis.status !== 'ready' && redis.status !== 'connecting') {
            return null; 
        }

        const raw = await redis.get(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        // If Redis throws (even terminal retry errors), swallow and return null
        return null;
    }
}

/** Truly fail-silent cache SET */
export async function setCache(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    try {
        const redis = getRedisClient();
        if (!redis || redis.status !== 'ready') return;
        await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
        // Silently ignore cache write failures
    }
}

/** Truly fail-silent cache DEL */
export async function delCache(key: string): Promise<void> {
    try {
        const redis = getRedisClient();
        if (!redis || redis.status !== 'ready') return;
        await redis.del(key);
    } catch {
        // Silently ignore
    }
}

/** Truly fail-silent pattern DEL */
export async function delCachePattern(pattern: string): Promise<void> {
    try {
        const redis = getRedisClient();
        if (!redis || redis.status !== 'ready') return;
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch {
        // Silently ignore
    }
}
