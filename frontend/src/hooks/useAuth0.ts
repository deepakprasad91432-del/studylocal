'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter, usePathname } from 'next/navigation';

export function useAuth0() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const loginWithRedirect = async (options?: { appState?: { returnTo?: string } }) => {
    // Use explicit returnTo > current pathname > fallback to '/'
    const returnTo = options?.appState?.returnTo ?? pathname ?? '/';
    const loginUrl = `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
    window.location.assign(loginUrl);
  };

  const logout = async (options?: { logoutParams?: { returnTo?: string } }) => {
    const returnTo = options?.logoutParams?.returnTo || window.location.origin;
    const logoutUrl = `/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`;
    window.location.assign(logoutUrl);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    loginWithRedirect,
    logout,
    error,
  };
}
