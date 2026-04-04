/**
 * In-memory rate limiter using a sliding window.
 * No external dependencies — works in both dev and prod (single-server).
 * For multi-instance deployments, swap this for @upstash/ratelimit.
 */

interface WindowEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, WindowEntry>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (now > entry.resetAt) store.delete(key);
        }
    }, 5 * 60 * 1000);
}

/**
 * Check if a key has exceeded the limit.
 * @param key    Unique identifier (e.g. userId or IP)
 * @param limit  Max requests allowed in window
 * @param windowMs  Window duration in ms (default 60s)
 * @returns { allowed: boolean, remaining: number, resetAt: Date }
 */
export function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        // New window
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
    }

    if (entry.count >= limit) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count += 1;
    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
