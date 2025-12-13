/**
 * Services index for Uninest Mobile
 * 
 * Central export point for all services.
 */

// Supabase client
export { supabase, authApi } from './supabase';

// Sentry crash reporting
export {
    initSentry,
    setSentryUser,
    addBreadcrumb,
    captureException,
    captureMessage,
    withSentry,
    Sentry,
} from './sentry';

// Analytics
export {
    analytics,
    trackEvent,
    trackScreen,
    identifyUser,
    resetAnalytics,
} from './analytics';
export type { AnalyticsEvent, AnalyticsProperties, UserProperties } from './analytics';

// Offline queue
export {
    offlineQueue,
    useOfflineQueue,
} from './offlineQueue';
export type { QueuedMutation, MutationType } from './offlineQueue';
