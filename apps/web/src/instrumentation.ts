import * as Sentry from "@sentry/nextjs";

export function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        Sentry.init({
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
            enabled: process.env.NODE_ENV === "production",
            tracesSampleRate: 1.0,
            sampleRate: 1.0,
            environment: process.env.NODE_ENV,
            release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "development",
            beforeSend(event) {
                return event;
            },
        });
    }

    if (process.env.NEXT_RUNTIME === "edge") {
        Sentry.init({
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
            enabled: process.env.NODE_ENV === "production",
            tracesSampleRate: 1.0,
            sampleRate: 1.0,
            environment: process.env.NODE_ENV,
            release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "development",
        });
    }
}
