
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'placehold.co',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'picsum.photos',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'yourcdn.com',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: '**',
    port: '',
    pathname: '/**',
  },
];

if (supabaseHost) {
  remotePatterns.push({
    protocol: 'https',
    hostname: supabaseHost,
    port: '',
    pathname: '/**',
  });
} else {
  remotePatterns.push({
    protocol: 'https',
    hostname: 'dfkgefoqodjccrrqmqis.supabase.co',
    port: '',
    pathname: '/**',
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns,
  },
  // SECURITY: Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

// Sentry configuration
import { withSentryConfig } from "@sentry/nextjs";

const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

const sentryOptions = {
  // Upload source maps to Sentry for better stack traces
  // Requires SENTRY_AUTH_TOKEN env var
  widenClientFileUpload: true,

  // Hide source maps from being accessible in browser
  hideSourceMaps: true,

  // Disable Sentry logger to reduce bundle size
  disableLogger: true,

  // Automatically instrument components
  automaticVercelMonitors: true,
};

// Export with Sentry wrapping (will gracefully degrade if Sentry not configured)
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions, sentryOptions)
  : nextConfig;
