import Constants from 'expo-constants';
import { getSupabaseClient } from '@uninest/api-client/src/client.native';
import { createAuthApi, createProductsApi, createOrdersApi, createWorkspaceApi } from '@uninest/api-client';

// Get environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration. Check your environment variables.');
}

// Initialize Supabase client
export const supabase = getSupabaseClient(supabaseUrl, supabaseAnonKey);

// Initialize API modules
export const authApi = createAuthApi(supabase);
export const productsApi = createProductsApi(supabase);
export const ordersApi = createOrdersApi(supabase);
export const workspaceApi = createWorkspaceApi(supabase);
