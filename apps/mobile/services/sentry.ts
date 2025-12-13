/**
 * Sentry Configuration for Uninest Mobile
 * 
 * Provides crash reporting and performance monitoring.
 * 
 * Setup:
 * 1. Create account at https://sentry.io
 * 2. Create a React Native project
 * 3. Add EXPO_PUBLIC_SENTRY_DSN to your .env file
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn || process.env.EXPO_PUBLIC_SENTRY_DSN;

/**
 * Initialize Sentry for the mobile app
 */
export function initSentry() {
    if (!SENTRY_DSN) {
        console.warn('[Sentry] DSN not configured. Crash reporting disabled.');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,

        // Set environment based on app variant
        environment: Constants.expoConfig?.extra?.eas?.projectId
            ? (process.env.APP_ENV || 'production')
            : 'development',

        // Release tracking
        release: `${Constants.expoConfig?.name}@${Constants.expoConfig?.version}`,
        dist: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode?.toString(),

        // Performance Monitoring
        tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 20% of transactions in production

        // Enable automatic instrumentation
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000,

        // Attach stack traces to all messages
        attachStacktrace: true,

        // Don't send events in development
        enabled: !__DEV__,

        // Filter sensitive data
        beforeSend(event) {
            // Remove sensitive data from breadcrumbs
            if (event.breadcrumbs) {
                event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
                    if (breadcrumb.data?.password) {
                        breadcrumb.data.password = '[REDACTED]';
                    }
                    if (breadcrumb.data?.token) {
                        breadcrumb.data.token = '[REDACTED]';
                    }
                    return breadcrumb;
                });
            }
            return event;
        },

        // Ignore certain errors
        ignoreErrors: [
            'Network request failed',
            'Failed to fetch',
            'AbortError',
        ],
    });
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: { id: string; email?: string; role?: string } | null) {
    if (user) {
        Sentry.setUser({
            id: user.id,
            email: user.email,
            role: user.role,
        });
    } else {
        Sentry.setUser(null);
    }
}

export type SentrySeverity = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

/**
 * Add a breadcrumb for user actions
 */
export function addBreadcrumb(
    category: string,
    message: string,
    data?: Record<string, unknown>,
    level: SentrySeverity = 'info'
) {
    Sentry.addBreadcrumb({
        category,
        message,
        data,
        level: level as any,
    });
}

/**
 * Capture an exception with additional context
 */
export function captureException(
    error: Error,
    context?: Record<string, unknown>
) {
    Sentry.withScope(scope => {
        if (context) {
            Object.entries(context).forEach(([key, value]) => {
                scope.setExtra(key, value);
            });
        }
        Sentry.captureException(error);
    });
}

/**
 * Capture a message for debugging
 */
export function captureMessage(
    message: string,
    level: SentrySeverity = 'info'
) {
    Sentry.captureMessage(message, level as any);
}

/**
 * Create a transaction for performance monitoring
 */
export function startTransaction(name: string, op: string) {
    // Cast to any to avoid type errors with different SDK versions
    return (Sentry as any).startTransaction
        ? (Sentry as any).startTransaction({ name, op })
        : { finish: () => { } }; // Fallback stub
}

/**
 * Wrap component with Sentry error boundary
 */
export const withSentry = Sentry.wrap;

/**
 * Navigation integration for tracking screen views
 */
export const SentryNavigationIntegration = Sentry.reactNavigationIntegration;

// Re-export Sentry for direct access
export { Sentry };
