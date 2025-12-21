import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Only enable in production
    enabled: process.env.NODE_ENV === "production",

    // Adjust this value for production
    // Setting to 1.0 means 100% of transactions will be sampled
    // For high-traffic apps, reduce this to 0.1 or lower
    tracesSampleRate: 1.0,

    // Capture 100% of errors
    sampleRate: 1.0,

    // Set environment
    environment: process.env.NODE_ENV,

    // Add release version for better tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "development",

    // Server-side specific options
    beforeSend(event) {
        // Remove server paths from stack traces if needed
        return event;
    },
});
