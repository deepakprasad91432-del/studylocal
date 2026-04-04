'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '@/context/LoadingContext';

/**
 * NavigationLoader
 * Automatically shows/hides the global loading overlay
 * whenever Next.js client-side navigation is detected.
 * 
 * Must be rendered inside <LoadingProvider> and <Suspense>.
 */
export function NavigationLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { setLoading } = useLoading();

    useEffect(() => {
        // Route has settled — hide the loader
        setLoading(false);
    }, [pathname, searchParams, setLoading]);

    return null;
}
