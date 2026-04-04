'use server';

import { auth0 } from '@/lib/auth0';
import dbConnect from '@/lib/db/connect';
import User, { IUser } from '@/lib/models/User';
import { getCache, setCache, delCache } from '@/lib/cache';

const USER_TTL = 300; // 5 minutes

function cacheKey(auth0Id: string) {
    return `user:${auth0Id}`;
}

export async function getUser(auth0Id: string) {
    if (!auth0Id) return null;

    const cached = await getCache<any>(cacheKey(auth0Id));
    if (cached) return cached;

    await dbConnect();
    const user = await User.findOne({ auth0Id }).lean();
    if (user) {
        const result = { ...user, _id: user._id.toString() };
        await setCache(cacheKey(auth0Id), result, USER_TTL);
        return result;
    }
    return null;
}

export async function createUser(data: Partial<IUser>) {
    await dbConnect();
    const user = await User.create(data);
    const result = { ...user.toObject(), _id: user._id.toString() };
    // Seed cache
    if (data.auth0Id) {
        await setCache(cacheKey(data.auth0Id), result, USER_TTL);
    }
    return result;
}

export async function updateUser(auth0Id: string, data: Partial<IUser>) {
    await dbConnect();
    const user = await User.findOneAndUpdate(
        { auth0Id },
        { $set: data },
        { new: true, upsert: true }
    ).lean();

    if (user) {
        const result = { ...user, _id: user._id.toString() };
        // Invalidate + re-seed cache
        await setCache(cacheKey(auth0Id), result, USER_TTL);
        return result;
    }
    return null;
}

export async function getCurrentUser() {
    const session = await auth0.getSession();
    if (!session?.user) return null;
    return getUser(session.user.sub);
}
