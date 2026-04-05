import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://studylocal.vercel.app';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/dashboard/',
                    '/api/',
                    '/_next/',
                    '/chat/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/dashboard/',
                    '/api/',
                    '/_next/',
                    '/chat/',
                ],
            },
            {
                userAgent: ['Applebot', 'Bingbot'],
                allow: '/',
                disallow: [
                    '/admin/',
                    '/dashboard/',
                    '/api/',
                    '/_next/',
                    '/chat/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
