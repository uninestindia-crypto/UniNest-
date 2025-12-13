import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { secureStorage } from './storage.native';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create Supabase client for React Native
 * Uses secure storage for token persistence
 */
export function getSupabaseClient(
    supabaseUrl: string,
    supabaseAnonKey: string
): SupabaseClient {
    if (supabaseInstance) {
        return supabaseInstance;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: secureStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false, // Important: disable for mobile
        },
    });

    return supabaseInstance;
}

/**
 * Reset the Supabase client instance (useful for testing)
 */
export function resetSupabaseClient(): void {
    supabaseInstance = null;
}

export { secureStorage };
