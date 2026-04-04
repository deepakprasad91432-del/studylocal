import { NextResponse } from 'next/server';

/**
 * GET /api/deploy-check
 * Returns the current build ID embedded at build time.
 * Used by DeployWatcher on the client to detect new deployments.
 */
export async function GET() {
    return NextResponse.json(
        { buildId: process.env.NEXT_PUBLIC_BUILD_ID || 'dev' },
        {
            headers: {
                // Never cache this endpoint
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        }
    );
}
