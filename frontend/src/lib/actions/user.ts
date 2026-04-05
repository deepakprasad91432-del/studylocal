'use server';

import { auth0 } from '@/lib/auth0';
import { api } from '@/lib/api-client';

export async function getUser(auth0Id: string) {
    if (!auth0Id) return null;
    try {
        return await api.get(`/user/${encodeURIComponent(auth0Id)}`);
    } catch {
        return null;
    }
}

export async function syncUser(userData: any) {
    try {
        return await api.post(`/user/sync`, userData);
    } catch (err) {
        console.error('[User Sync] Failed to sync user data:', err);
        return { success: false };
    }
}

export async function updateUser(auth0Id: string, data: any) {
    if (!auth0Id) {
        return { success: false, message: 'Auth0 ID is required' };
    }
    
    try {
        const result = await api.patch(`/user/${encodeURIComponent(auth0Id)}`, data);
        return { success: true, data: result };
    } catch (err: any) {
        console.error('[User Update] Server Action Error:', {
            auth0Id,
            error: err.message,
            stack: err.stack,
            backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL
        });
        return { 
            success: false, 
            message: err.message || 'Failed to update user profile. Check backend connectivity.' 
        };
    }
}

export async function getCurrentUser() {
    const session = await auth0.getSession();
    if (!session?.user) return null;
    return getUser(session.user.sub);
}
