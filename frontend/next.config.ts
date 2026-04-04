/* eslint-disable @typescript-eslint/no-explicit-any */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Performance ───────────────────────────────────────────────────────────
  compress: true,           // Gzip all responses
  poweredByHeader: false,   // Remove X-Powered-By header (minor security + size)
  reactStrictMode: true,    // Better React tree-shaking and warnings
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 's.gravatar.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.auth0.com' },
      { protocol: 'https', hostname: 'i0.wp.com' },
    ],
    dangerouslyAllowSVG: true,
    // Serve modern compressed image formats to browsers that support them
    formats: ['image/avif', 'image/webp'],
  },

  // ── Caching headers ───────────────────────────────────────────────────────
  async headers() {
    return [
      // Long-lived cache for all static assets (JS, CSS, fonts, images)
      // Next.js content-hashes these files so cache busting is automatic
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        "mongodb-client-encryption": false,
        "aws-crt": false,
        "dns": false,
        "timers": false,
        "timers/promises": false,
        "async_hooks": false,
        "ioredis": false,
      };
    }
    return config;
  },
};

export default withPWA(nextConfig);
