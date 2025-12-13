/**
 * Analytics Service for Uninest Mobile
 * 
 * Provides a unified interface for tracking user behavior and events.
 * Currently implements a simple logger that can be connected to:
 * - Firebase Analytics
 * - Mixpanel
 * - Amplitude
 * - PostHog
 * 
 * The abstraction allows easy swapping of analytics providers.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Analytics event types
export type AnalyticsEvent =
    // Authentication
    | 'sign_up'
    | 'login'
    | 'logout'
    | 'password_reset'
    // Navigation
    | 'screen_view'
    | 'deep_link_opened'
    // Products
    | 'product_view'
    | 'product_search'
    | 'product_filter'
    // Booking
    | 'booking_started'
    | 'booking_completed'
    | 'booking_cancelled'
    | 'payment_initiated'
    | 'payment_completed'
    | 'payment_failed'
    // Vendor
    | 'listing_created'
    | 'listing_updated'
    | 'listing_deleted'
    | 'order_accepted'
    | 'order_rejected'
    // Engagement
    | 'notification_received'
    | 'notification_opened'
    | 'share'
    | 'app_open'
    | 'app_background';

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

// User properties for segmentation
export interface UserProperties {
    userId?: string;
    email?: string;
    role?: string;
    signUpDate?: string;
    totalOrders?: number;
    isVendor?: boolean;
}

// Analytics provider interface
interface AnalyticsProvider {
    initialize(): Promise<void>;
    track(event: AnalyticsEvent, properties?: AnalyticsProperties): void;
    screen(name: string, properties?: AnalyticsProperties): void;
    identify(userId: string, properties?: UserProperties): void;
    reset(): void;
}

// Console logger for development
class ConsoleAnalyticsProvider implements AnalyticsProvider {
    async initialize() {
        console.log('[Analytics] Initialized (Console Provider)');
    }

    track(event: AnalyticsEvent, properties?: AnalyticsProperties) {
        console.log(`[Analytics] Event: ${event}`, properties);
    }

    screen(name: string, properties?: AnalyticsProperties) {
        console.log(`[Analytics] Screen: ${name}`, properties);
    }

    identify(userId: string, properties?: UserProperties) {
        console.log(`[Analytics] Identify: ${userId}`, properties);
    }

    reset() {
        console.log('[Analytics] Reset');
    }
}

// Offline-capable analytics that queues events
class OfflineAnalyticsProvider implements AnalyticsProvider {
    private queue: Array<{ type: string; data: unknown; timestamp: number }> = [];
    private readonly QUEUE_KEY = 'analytics_queue';
    private readonly MAX_QUEUE_SIZE = 100;
    private isProcessing = false;

    async initialize() {
        // Load queued events from storage
        try {
            const stored = await AsyncStorage.getItem(this.QUEUE_KEY);
            if (stored) {
                this.queue = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('[Analytics] Failed to load queue:', error);
        }

        // Process queue on init
        this.processQueue();
    }

    track(event: AnalyticsEvent, properties?: AnalyticsProperties) {
        this.addToQueue('track', { event, properties });
    }

    screen(name: string, properties?: AnalyticsProperties) {
        this.addToQueue('screen', { name, properties });
    }

    identify(userId: string, properties?: UserProperties) {
        this.addToQueue('identify', { userId, properties });
    }

    reset() {
        this.addToQueue('reset', {});
    }

    private addToQueue(type: string, data: unknown) {
        this.queue.push({
            type,
            data,
            timestamp: Date.now(),
        });

        // Trim queue if too large
        if (this.queue.length > this.MAX_QUEUE_SIZE) {
            this.queue = this.queue.slice(-this.MAX_QUEUE_SIZE);
        }

        // Save to storage
        this.saveQueue();

        // Try to process
        this.processQueue();
    }

    private async saveQueue() {
        try {
            await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue));
        } catch (error) {
            console.warn('[Analytics] Failed to save queue:', error);
        }
    }

    private async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;

        try {
            // In a real implementation, this would send to your analytics backend
            // For now, we just log and clear
            if (__DEV__) {
                this.queue.forEach(item => {
                    console.log(`[Analytics] ${item.type}:`, item.data);
                });
            }

            // Clear processed events
            this.queue = [];
            await this.saveQueue();

        } catch (error) {
            console.warn('[Analytics] Failed to process queue:', error);
        } finally {
            this.isProcessing = false;
        }
    }
}

// Singleton analytics instance
class Analytics {
    private provider: AnalyticsProvider;
    private isInitialized = false;
    private userId: string | null = null;

    constructor() {
        // Use console in dev, offline-capable in production
        this.provider = __DEV__
            ? new ConsoleAnalyticsProvider()
            : new OfflineAnalyticsProvider();
    }

    async initialize() {
        if (this.isInitialized) return;

        await this.provider.initialize();
        this.isInitialized = true;

        // Track app open
        this.track('app_open');
    }

    /**
     * Track a custom event
     */
    track(event: AnalyticsEvent, properties?: AnalyticsProperties) {
        if (!this.isInitialized) {
            console.warn('[Analytics] Not initialized. Call initialize() first.');
            return;
        }

        this.provider.track(event, {
            ...properties,
            timestamp: Date.now(),
        });
    }

    /**
     * Track a screen view
     */
    screen(name: string, properties?: AnalyticsProperties) {
        if (!this.isInitialized) return;

        this.provider.screen(name, properties);
    }

    /**
     * Identify a user
     */
    identify(userId: string, properties?: UserProperties) {
        if (!this.isInitialized) return;

        this.userId = userId;
        this.provider.identify(userId, properties);
    }

    /**
     * Reset user identity (on logout)
     */
    reset() {
        if (!this.isInitialized) return;

        this.userId = null;
        this.provider.reset();
    }

    /**
     * Get current user ID
     */
    getUserId() {
        return this.userId;
    }
}

// Export singleton instance
export const analytics = new Analytics();

// Convenience functions
export const trackEvent = (event: AnalyticsEvent, properties?: AnalyticsProperties) =>
    analytics.track(event, properties);

export const trackScreen = (name: string, properties?: AnalyticsProperties) =>
    analytics.screen(name, properties);

export const identifyUser = (userId: string, properties?: UserProperties) =>
    analytics.identify(userId, properties);

export const resetAnalytics = () =>
    analytics.reset();
