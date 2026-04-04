'use server';

import dbConnect from '@/lib/db/connect';
import TutorProfile from '@/lib/models/TutorProfile';
import { buildTutorQuery, TutorFilterParams } from '@/lib/utils/filter';
import { getCache, setCache } from '@/lib/cache';

const TUTOR_TTL = 300; // 5 minutes

// ── Types ────────────────────────────────────────────────────────────────────
export interface PaginatedTutors {
    tutors: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// ── Paginated list (no cache — filters change constantly) ─────────────────────
export async function getTutors(
    filters: TutorFilterParams,
    page: number = 1,
    limit: number = 10
): Promise<PaginatedTutors> {
    try {
        await dbConnect();
        const query = buildTutorQuery(filters);
        const skip = (page - 1) * limit;

        const [tutors, total] = await Promise.all([
            TutorProfile.find(query)
                .select('fullName photoUrl subjects classRange area monthlyFee tuitionMode')
                .skip(skip)
                .limit(limit)
                .lean(),
            TutorProfile.countDocuments(query),
        ]);

        return {
            tutors: tutors.map((t: any) => ({ ...t, _id: t._id.toString() })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error('[search] Failed to fetch tutors:', error);
        return {
            tutors: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        };
    }
}

// ── Single tutor by MongoDB _id ───────────────────────────────────────────────
export async function getTutorById(id: string) {
    if (!id) return null;
    const cacheKey = `tutor:id:${id}`;

    const cached = await getCache<any>(cacheKey);
    if (cached) return cached;

    try {
        await dbConnect();
        const tutor = await TutorProfile.findById(id).lean();
        if (!tutor) return null;
        const result = { ...tutor, _id: tutor._id.toString() };
        await setCache(cacheKey, result, TUTOR_TTL);
        return result;
    } catch {
        return null;
    }
}

// ── Single tutor by Auth0 ID ──────────────────────────────────────────────────
export async function getTutorByAuth0Id(auth0Id: string) {
    if (!auth0Id) return null;
    const cacheKey = `tutor:auth0:${auth0Id}`;

    const cached = await getCache<any>(cacheKey);
    if (cached) return cached;

    try {
        await dbConnect();
        const tutor = await TutorProfile.findOne({ auth0Id }).lean();
        if (!tutor) return null;
        const result = { ...tutor, _id: tutor._id.toString() };
        await setCache(cacheKey, result, TUTOR_TTL);
        return result;
    } catch {
        return null;
    }
}
