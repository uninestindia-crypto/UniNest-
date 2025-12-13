/**
 * Storage adapter types for platform-specific token storage
 */
export interface StorageAdapter {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
}

/**
 * Storage keys used throughout the app
 */
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'uninest_access_token',
    REFRESH_TOKEN: 'uninest_refresh_token',
    USER_SESSION: 'uninest_user_session',
} as const;
