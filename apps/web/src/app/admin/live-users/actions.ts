'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase service role key is not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

export type UserSession = {
    id: string;
    user_id: string | null;
    session_id: string;
    is_authenticated: boolean;
    login_time: string | null;
    last_activity: string;
    current_page: string | null;
    device_info: string | null;
    ip_address: string | null;
    profiles?: {
        full_name: string | null;
        avatar_url: string | null;
        email: string | null;
    } | null;
};

export type LiveUsersStats = {
    totalUsers: number;
    totalVisitors: number;
    activeUsers: number;
    activeVisitors: number;
    recentSessions: UserSession[];
};

export async function getLiveUsersStats(): Promise<{ data: LiveUsersStats | null; error: string | null }> {
    try {
        const supabaseAdmin = getSupabaseAdmin();

        // Get count of all users from profiles
        const { count: totalUsers, error: usersError } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (usersError) {
            throw new Error(`Failed to count users: ${usersError.message}`);
        }

        // For now, we'll use auth.users last sign-in to estimate activity
        // This is a simplified version - in production you'd have a proper sessions table
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Get recent profiles (users who updated their profile recently as a proxy for activity)
        const { data: recentProfiles, error: recentError } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, avatar_url, email, updated_at')
            .order('updated_at', { ascending: false })
            .limit(20);

        if (recentError) {
            console.error('Error fetching recent profiles:', recentError);
        }

        // Transform profiles to session-like format for display
        const recentSessions: UserSession[] = (recentProfiles || []).map((profile, index) => ({
            id: `session-${profile.id}`,
            user_id: profile.id,
            session_id: `sess-${profile.id.slice(0, 8)}`,
            is_authenticated: true,
            login_time: profile.updated_at,
            last_activity: profile.updated_at,
            current_page: '/workspace',
            device_info: 'Web Browser',
            ip_address: null,
            profiles: {
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                email: profile.email,
            }
        }));

        // Get audit log entries to estimate recent activity
        const { data: recentLogs, error: logsError } = await supabaseAdmin
            .from('audit_log')
            .select('admin_id, created_at')
            .gte('created_at', thirtyMinutesAgo)
            .order('created_at', { ascending: false });

        const activeAdminIds = new Set((recentLogs || []).map(log => log.admin_id));

        return {
            data: {
                totalUsers: totalUsers || 0,
                totalVisitors: totalUsers || 0, // Using total users as a baseline proxy until proper visitor tracking is added
                activeUsers: activeAdminIds.size || Math.min(recentSessions.length, 5),
                activeVisitors: activeAdminIds.size || 0, // Using active admins as a proxy
                recentSessions,
            },
            error: null,
        };
    } catch (e: any) {
        return { data: null, error: e.message };
    }
}

export async function trackPageVisit(userId: string | null, page: string, deviceInfo: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin();

        // This would insert into a user_sessions table if we had one
        // For now, we just log to audit_log for admin actions
        if (userId) {
            await supabaseAdmin
                .from('audit_log')
                .insert({
                    admin_id: userId,
                    action: 'page_visit',
                    details: JSON.stringify({ page, deviceInfo, timestamp: new Date().toISOString() }),
                });
        }

        return { error: null };
    } catch (e: any) {
        return { error: e.message };
    }
}
