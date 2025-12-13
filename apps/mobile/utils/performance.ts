/**
 * Performance Utilities for Uninest Mobile
 * 
 * Tools and patterns for optimizing app performance.
 */

import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import { InteractionManager } from 'react-native';

/**
 * Delay heavy operations until interactions are complete
 * Useful for running analytics, prefetching, or setup after navigation
 */
export function afterInteractions(callback: () => void): void {
    InteractionManager.runAfterInteractions(callback);
}

/**
 * A hook that ensures cleanup for expensive operations
 * Returns a function that will only execute if component is still mounted
 */
export function useSafeCallback<T extends (...args: any[]) => any>(
    callback: T
): T {
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return useCallback(
        ((...args) => {
            if (isMountedRef.current) {
                return callback(...args);
            }
        }) as T,
        [callback]
    );
}

/**
 * Debounce hook for expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Throttle hook for high-frequency updates
 */
export function useThrottle<T>(value: T, limit: number): T {
    const [throttledValue, setThrottledValue] = React.useState(value);
    const lastRan = useRef(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, limit - (Date.now() - lastRan.current));

        return () => {
            clearTimeout(handler);
        };
    }, [value, limit]);

    return throttledValue;
}

/**
 * Memoize expensive computations with dependency tracking
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList
): T {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(callback, deps);
}

/**
 * Memoize objects to prevent unnecessary re-renders
 */
export function useMemoizedValue<T>(
    factory: () => T,
    deps: React.DependencyList
): T {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deps);
}

/**
 * Higher-order component for memoization with custom comparison
 */
export function withMemo<P extends object>(
    Component: React.ComponentType<P>,
    propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
    return memo(Component, propsAreEqual);
}

/**
 * Shallow comparison for props
 */
export function shallowEqual<T extends Record<string, unknown>>(
    objA: T,
    objB: T
): boolean {
    if (objA === objB) return true;
    if (!objA || !objB) return false;

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (objA[key] !== objB[key]) return false;
    }

    return true;
}

/**
 * Type for FlashList render item
 */
export type ListRenderItem<T> = (info: {
    item: T;
    index: number;
}) => React.ReactElement | null;

/**
 * Create an optimized key extractor
 */
export function createKeyExtractor<T extends { id: string | number }>(
    prefix = ''
): (item: T, index: number) => string {
    return (item, index) => `${prefix}${item.id ?? index}`;
}

/**
 * Batch state updates for performance
 * React 18+ has automatic batching, but this is useful for async operations
 */
export function batchUpdates(callback: () => void): void {
    // In React 18+, updates are automatically batched
    // This is provided for consistency and future compatibility
    callback();
}

/**
 * Estimate item size for FlashList
 * More accurate estimates = better performance
 */
export const ESTIMATED_ITEM_SIZES = {
    listItem: 72, // Standard list item with avatar
    card: 280, // Product card
    compactCard: 120, // Compact card
    header: 56, // Section header
    separator: 1, // List separator
} as const;

/**
 * Performance monitoring utilities
 */
export const perfMonitor = {
    marks: new Map<string, number>(),

    start(label: string) {
        this.marks.set(label, performance.now());
    },

    end(label: string): number {
        const startTime = this.marks.get(label);
        if (!startTime) {
            console.warn(`[PerfMonitor] No start mark for: ${label}`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.marks.delete(label);

        if (__DEV__) {
            console.log(`[PerfMonitor] ${label}: ${duration.toFixed(2)}ms`);
        }

        return duration;
    },

    measure(label: string, callback: () => void): number {
        this.start(label);
        callback();
        return this.end(label);
    },

    async measureAsync<T>(label: string, callback: () => Promise<T>): Promise<T> {
        this.start(label);
        const result = await callback();
        this.end(label);
        return result;
    },
};
