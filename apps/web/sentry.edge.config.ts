import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Only enable in production
    enabled: process.env.NODE_ENV === "production",

    // Edge runtime specific settings
    tracesSampleRate: 1.0,
    sampleRate: 1.0,

    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "development",
});
