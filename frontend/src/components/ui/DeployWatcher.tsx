'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const CHECK_INTERVAL_MS = 60_000; // Check every 60 seconds

/**
 * DeployWatcher
 * Embeds the build ID at compile time via NEXT_PUBLIC_BUILD_ID.
 * Polls /api/deploy-check every 60s and on navigation/tab-focus.
 * If the server reports a different build ID, auto-reloads to
 * prevent "Server Action not found" errors from stale client bundles.
 */
export default function DeployWatcher() {
    const currentBuildId = process.env.NEXT_PUBLIC_BUILD_ID || 'dev';
    const hasChecked = useRef(false);
    const pathname = usePathname();

    const checkForNewDeploy = async () => {
        // Skip in development or if no build ID is defined
        if (!process.env.NEXT_PUBLIC_BUILD_ID) return;
        try {
            const res = await fetch(`/api/deploy-check`, { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json();
            if (data.buildId && data.buildId !== currentBuildId) {
                console.info('[DeployWatcher] New deployment detected. Reloading...');
                window.location.reload();
            }
            hasChecked.current = true;
        } catch {
            // Silent fail
        }
    };

    useEffect(() => {
        checkForNewDeploy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    useEffect(() => {
        const timer = setInterval(checkForNewDeploy, CHECK_INTERVAL_MS);
        return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const onFocus = () => {
            if (document.visibilityState === 'visible') checkForNewDeploy();
        };
        document.addEventListener('visibilitychange', onFocus);
        return () => document.removeEventListener('visibilitychange', onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
