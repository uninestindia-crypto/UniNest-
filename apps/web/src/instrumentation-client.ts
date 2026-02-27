import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Only enable in production
    enabled: process.env.NODE_ENV === "production",

    // Adjust this value for production
    // Setting to 1.0 means 100% of transactions will be sampled
    // For high-traffic apps, reduce this to 0.1 or lower
    tracesSampleRate: 1.0,

    // Capture 100% of errors (don't sample these down)
    sampleRate: 1.0,

    // Set environment
    environment: process.env.NODE_ENV,

    // Ignore common non-actionable errors
    ignoreErrors: [
        // Network errors that users can't control
        "Network request failed",
        "Failed to fetch",
        "NetworkError",
        "AbortError",
        // Browser extension noise
        "chrome-extension://",
        "moz-extension://",
        // User-triggered navigation
        "cancelled",
    ],

    // Before sending to Sentry, you can modify/filter events
    beforeSend(event, hint) {
        // Don't send errors from localhost
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            return null;
        }

        // Add additional context
        if (event.user) {
            // Remove PII if needed
            delete event.user.email;
            delete event.user.ip_address;
        }

        return event;
    },

    // Add release version for better tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "development",
});
