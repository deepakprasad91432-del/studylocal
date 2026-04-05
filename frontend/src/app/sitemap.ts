import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db/connect';
import TutorProfile from '@/lib/models/TutorProfile';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://studylocal.vercel.app';

    await dbConnect();
    const tutors = await TutorProfile.find({ isApproved: true }, '_id updatedAt').lean();

    const tutorUrls = tutors.map((tutor) => ({
        url: `${baseUrl}/tutor/${tutor._id}`,
        lastModified: (tutor as any).updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/tutors`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/tutor-registration`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.3,
        },
    ];

    return [...staticRoutes, ...tutorUrls];
}

