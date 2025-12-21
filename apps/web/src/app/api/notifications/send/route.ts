
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification } from '@/lib/notifications';

/**
 * SECURITY: Helper to verify the requesting user is an admin
 * Checks admin role from database (profiles table), not JWT claims
 */
const verifyAdmin = async (request: Request) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return null;

    // SECURITY: Verify admin role from DATABASE, not email comparison
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile || profile.role !== 'admin') {
        return null;
    }

    return user;
}

export async function POST(request: Request) {
    // 1. Authenticate Admin
    const adminUser = await verifyAdmin(request);
    if (!adminUser) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { userIds, title, body: messageBody, data } = body;

        if (!Array.isArray(userIds) || !title || !messageBody) {
            return NextResponse.json({ error: 'Invalid payload. Required: userIds[], title, body.' }, { status: 400 });
        }

        // 2. Send Notifications
        await sendPushNotification(userIds, title, messageBody, data);

        return NextResponse.json({ success: true, message: `Notification queued for ${userIds.length} users.` });

    } catch (error: any) {
        console.error('Admin Notification Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

