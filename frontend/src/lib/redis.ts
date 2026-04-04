/**
 * Redis client singleton with aggressive graceful fallback.
 * If REDIS_URL is not set OR connection fails OR reaches max retries,
 * it sets a global kill-switch to avoid further connection attempts.
 */
import Redis from 'ioredis';

declare global {
    var _redis: Redis | null | undefined;
    var _redis_failed: boolean | undefined;
}

function getRedisClient(): Redis | null {
    if (typeof window !== 'undefined') return null; // client-side guard

    // 1. Check if we've already marked Redis as permanently failed for this session.
    if (global._redis_failed) return null;

    // 2. Reuse existing client if available.
    if (global._redis !== undefined) return global._redis;

    const url = process.env.REDIS_URL?.trim();
    if (!url) {
        console.info('[Redis] REDIS_URL not set — caching disabled.');
        global._redis = null;
        return null;
    }

    try {
        const client = new Redis(url, {
            // Set to 0 to fail IMMEDIATELY on the first error,
            // allowing us to trigger the kill-switch.
            maxRetriesPerRequest: 0, 
            connectTimeout: 1500,
            lazyConnect: true,
            retryStrategy(times) {
                // If it fails even once, kill it to prevent event loop delay
                console.error('[Redis] Connection failed. Disabling caching for this process life.');
                global._redis_failed = true;
                global._redis = null;
                return null; // Stop retries
            }
        });

        client.on('error', (err) => {
            // In dev mode, we want to know why it's failing, once.
            if (process.env.NODE_ENV === 'development') {
                console.warn('[Redis] Connection Error:', err.message);
            }
            // Kill switch
            global._redis_failed = true;
            global._redis = null;
            client.disconnect();
        });

        global._redis = client;
        return client;
    } catch {
        global._redis_failed = true;
        global._redis = null;
        return null;
    }
}

export default getRedisClient;
