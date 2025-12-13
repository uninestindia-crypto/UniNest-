import type { SupabaseClient, User, Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '@uninest/shared-types';

export interface AuthState {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    role: UserRole;
    isLoading: boolean;
}

/**
 * Authentication API module
 */
export function createAuthApi(supabase: SupabaseClient) {
    return {
        /**
         * Sign in with email and password
         */
        async signIn(email: string, password: string) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            return data;
        },

        /**
         * Sign up with email and password
         */
        async signUp(
            email: string,
            password: string,
            metadata?: { full_name?: string; role?: UserRole }
        ) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: metadata?.full_name,
                        role: metadata?.role || 'student',
                    },
                },
            });
            if (error) throw error;
            return data;
        },

        /**
         * Sign out current user
         */
        async signOut() {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        },

        /**
         * Get current session
         */
        async getSession() {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            return data.session;
        },

        /**
         * Refresh the current session
         */
        async refreshSession() {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) throw error;
            return data.session;
        },

        /**
         * Reset password
         */
        async resetPassword(email: string) {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
        },

        /**
         * Update password for logged in user
         */
        async updatePassword(password: string) {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
        },

        /**
         * Get user profile from profiles table
         */
        async getProfile(userId: string): Promise<Profile | null> {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return data as Profile;
        },

        /**
         * Update user profile
         */
        async updateProfile(
            userId: string,
            updates: Partial<Omit<Profile, 'id'>>
        ): Promise<Profile | null> {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data as Profile;
        },

        /**
         * Subscribe to auth state changes
         */
        onAuthStateChange(
            callback: (event: string, session: Session | null) => void
        ) {
            return supabase.auth.onAuthStateChange(callback);
        },

        /**
         * Determine user role from metadata
         */
        getUserRole(user: User | null): UserRole {
            if (!user) return 'guest';
            return (user.user_metadata?.role as UserRole) || 'student';
        },
    };
}
