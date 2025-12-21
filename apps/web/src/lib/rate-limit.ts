/**
 * Simple in-memory rate limiter for Next.js Edge Runtime
 * 
 * SECURITY: This provides basic protection against brute force attacks
 * Note: For distributed deployments, use Redis-based solutions like @upstash/ratelimit
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup > CLEANUP_INTERVAL) {
        for (const [key, entry] of rateLimitStore.entries()) {
            if (entry.resetTime < now) {
                rateLimitStore.delete(key);
            }
        }
        lastCleanup = now;
    }
}

export interface RateLimitConfig {
    /** Maximum number of requests allowed in the window */
    maxRequests: number;
    /** Time window in milliseconds */
    windowMs: number;
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number;
}

/**
 * Check if a request is rate limited
 * @param identifier - Unique identifier for the client (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    cleanup();

    const now = Date.now();
    const key = identifier;
    const entry = rateLimitStore.get(key);

    // If no entry or window has expired, create new entry
    if (!entry || entry.resetTime < now) {
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetIn: config.windowMs,
        };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetIn: entry.resetTime - now,
        };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetIn: entry.resetTime - now,
    };
}

// Preset configurations for different use cases
export const RATE_LIMITS = {
    // Login: 5 attempts per minute
    LOGIN: { maxRequests: 5, windowMs: 60 * 1000 },
    // Signup: 3 attempts per 10 minutes
    SIGNUP: { maxRequests: 3, windowMs: 10 * 60 * 1000 },
    // API: 100 requests per minute
    API: { maxRequests: 100, windowMs: 60 * 1000 },
    // Payment: 10 orders per minute
    PAYMENT: { maxRequests: 10, windowMs: 60 * 1000 },
    // Admin setup: 3 attempts per hour (very strict)
    ADMIN_SETUP: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
};
