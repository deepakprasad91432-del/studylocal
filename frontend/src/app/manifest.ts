import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'StudyLocal | Find Neighbourhood Tutors',
        short_name: 'StudyLocal',
        description: 'Connect with verified tutors in your local area. No commission, COD only.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#16a34a',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/web-app-manifest-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/web-app-manifest-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
