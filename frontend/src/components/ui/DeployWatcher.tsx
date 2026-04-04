'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const CHECK_INTERVAL_MS = 60_000; // Check every 60 seconds

/**
 * DeployWatcher
 * Silently polls /_next/static/build-manifest.json on every navigation and
 * every 60 seconds. If the build hash changes (i.e., new Vercel deployment),
 * it automatically reloads the page so the client is always on the
 * latest Server Action IDs — preventing the "Server Action not found" error.
 */
export default function DeployWatcher() {
    const buildIdRef = useRef<string | null>(null);
    const pathname = usePathname();

    const checkForNewDeploy = async () => {
        try {
            // Fetch the build manifest with cache-busting
            const res = await fetch(`/_next/static/build-manifest.json?ts=${Date.now()}`, {
                cache: 'no-store',
            });
            if (!res.ok) return;

            const etag = res.headers.get('etag') || res.headers.get('last-modified');
            const text = await res.text();
            // Use a simple hash of the content to detect changes
            const hash = etag || text.slice(0, 100);

            if (buildIdRef.current === null) {
                // First load — store current hash
                buildIdRef.current = hash;
            } else if (buildIdRef.current !== hash) {
                // Hash changed — new deployment detected!
                console.info('[DeployWatcher] New deployment detected. Reloading...');
                window.location.reload();
            }
        } catch {
            // Silent fail — network issues shouldn't crash the app
        }
    };

    // Check on every route change
    useEffect(() => {
        checkForNewDeploy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // Also check on a timer
    useEffect(() => {
        const timer = setInterval(checkForNewDeploy, CHECK_INTERVAL_MS);
        return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Also check when user returns to the tab (very effective)
    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkForNewDeploy();
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null; // Renders nothing
}
