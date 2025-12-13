/**
 * Offline Mutation Queue for Uninest Mobile
 * 
 * Queues mutations when offline and syncs when connection is restored.
 * Works with React Query for seamless integration.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { captureException, addBreadcrumb } from './sentry';

const QUEUE_KEY = 'offline_mutation_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Mutation types
export type MutationType =
    | 'create_order'
    | 'cancel_order'
    | 'update_profile'
    | 'create_listing'
    | 'update_listing'
    | 'delete_listing'
    | 'update_order_status';

// Queued mutation structure
export interface QueuedMutation {
    id: string;
    type: MutationType;
    payload: unknown;
    timestamp: number;
    retries: number;
    userId: string;
}

// Mutation handler type
type MutationHandler = (payload: unknown) => Promise<void>;

export class OfflineQueueService {
    private queue: QueuedMutation[] = [];
    private handlers: Map<MutationType, MutationHandler> = new Map();
    private isProcessing = false;
    private isOnline = true;
    private unsubscribeNetInfo: (() => void) | null = null;

    /**
     * Initialize the queue and start listening for network changes
     */
    async initialize() {
        // Load existing queue from storage
        await this.loadQueue();

        // Subscribe to network changes
        this.unsubscribeNetInfo = NetInfo.addEventListener(this.handleNetworkChange);

        // Check initial network status
        const state = await NetInfo.fetch();
        this.isOnline = state.isConnected ?? true;

        // Process queue if online
        if (this.isOnline) {
            this.processQueue();
        }

        addBreadcrumb('offline_queue', 'Initialized', {
            queueSize: this.queue.length,
            isOnline: this.isOnline
        });
    }

    /**
     * Cleanup subscriptions
     */
    destroy() {
        if (this.unsubscribeNetInfo) {
            this.unsubscribeNetInfo();
            this.unsubscribeNetInfo = null;
        }
    }

    /**
     * Register a handler for a mutation type
     */
    registerHandler(type: MutationType, handler: MutationHandler) {
        this.handlers.set(type, handler);
    }

    /**
     * Add a mutation to the queue
     */
    async enqueue(
        type: MutationType,
        payload: unknown,
        userId: string
    ): Promise<string> {
        const mutation: QueuedMutation = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            payload,
            timestamp: Date.now(),
            retries: 0,
            userId,
        };

        this.queue.push(mutation);
        await this.saveQueue();

        addBreadcrumb('offline_queue', 'Mutation queued', {
            type,
            id: mutation.id,
            isOnline: this.isOnline
        });

        // If online, process immediately
        if (this.isOnline) {
            this.processQueue();
        }

        return mutation.id;
    }

    /**
     * Remove a mutation from the queue
     */
    async dequeue(id: string) {
        this.queue = this.queue.filter(m => m.id !== id);
        await this.saveQueue();
    }

    /**
     * Get all pending mutations
     */
    getPendingMutations(): QueuedMutation[] {
        return [...this.queue];
    }

    /**
     * Get pending mutations count
     */
    getPendingCount(): number {
        return this.queue.length;
    }

    /**
     * Check if there are pending mutations
     */
    hasPendingMutations(): boolean {
        return this.queue.length > 0;
    }

    /**
     * Get online status
     */
    getIsOnline(): boolean {
        return this.isOnline;
    }

    /**
     * Handle network state changes
     */
    private handleNetworkChange = (state: NetInfoState) => {
        const wasOffline = !this.isOnline;
        this.isOnline = state.isConnected ?? true;

        addBreadcrumb('network', 'Connection changed', {
            isConnected: state.isConnected,
            type: state.type
        });

        // If came back online, process queue
        if (wasOffline && this.isOnline) {
            this.processQueue();
        }
    };

    /**
     * Process the mutation queue
     */
    private async processQueue() {
        if (this.isProcessing || !this.isOnline || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        addBreadcrumb('offline_queue', 'Processing queue', { count: this.queue.length });

        // Process mutations in order
        const mutationsToProcess = [...this.queue];

        for (const mutation of mutationsToProcess) {
            try {
                await this.processMutation(mutation);
                await this.dequeue(mutation.id);
            } catch (error) {
                // Handle retry logic
                mutation.retries++;

                if (mutation.retries >= MAX_RETRIES) {
                    // Max retries reached, remove and report
                    captureException(error as Error, {
                        mutationType: mutation.type,
                        mutationId: mutation.id,
                        retries: mutation.retries,
                    });
                    await this.dequeue(mutation.id);

                    addBreadcrumb('offline_queue', 'Mutation failed permanently', {
                        type: mutation.type,
                        id: mutation.id
                    }, 'error');
                } else {
                    // Update retry count and save
                    await this.saveQueue();

                    // Wait before next retry
                    await this.delay(RETRY_DELAY_MS * mutation.retries);
                }
            }
        }

        this.isProcessing = false;
    }

    /**
     * Process a single mutation
     */
    private async processMutation(mutation: QueuedMutation): Promise<void> {
        const handler = this.handlers.get(mutation.type);

        if (!handler) {
            console.warn(`[OfflineQueue] No handler for mutation type: ${mutation.type}`);
            return;
        }

        await handler(mutation.payload);
    }

    /**
     * Load queue from AsyncStorage
     */
    private async loadQueue() {
        try {
            const stored = await AsyncStorage.getItem(QUEUE_KEY);
            if (stored) {
                this.queue = JSON.parse(stored);
            }
        } catch (error) {
            console.error('[OfflineQueue] Failed to load queue:', error);
            this.queue = [];
        }
    }

    /**
     * Save queue to AsyncStorage
     */
    private async saveQueue() {
        try {
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
        } catch (error) {
            console.error('[OfflineQueue] Failed to save queue:', error);
        }
    }

    /**
     * Delay helper
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueService();

// React hook for offline queue
import { useState, useEffect } from 'react';

export function useOfflineQueue() {
    const [pendingCount, setPendingCount] = useState(offlineQueue.getPendingCount());
    const [isOnline, setIsOnline] = useState(offlineQueue.getIsOnline());

    useEffect(() => {
        // Poll for updates (simple approach)
        const interval = setInterval(() => {
            setPendingCount(offlineQueue.getPendingCount());
            setIsOnline(offlineQueue.getIsOnline());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return {
        pendingCount,
        isOnline,
        hasPendingMutations: pendingCount > 0,
        enqueue: offlineQueue.enqueue.bind(offlineQueue),
        getPendingMutations: offlineQueue.getPendingMutations.bind(offlineQueue),
    };
}
