
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification } from '@/lib/notifications';

// Helper to verify admin
const verifyAdmin = async (request: Request) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    // Check for Service Key in headers (for potential internal calls) 
    // OR verify session token and check role

    // Simplest approach: Use Service Key for true "Admin" status bypass,
    // or verify JWT from a known admin user.
    // For this context, we'll verify the JWT is from a user with 'service_role' or specific metadata
    // BUT since we don't have a robust RBAC system setup yet, we'll use a SECRET HEADER 
    // or standard Auth logic if we assume the caller is logged in as admin.

    // Let's assume standard auth + simple email check for now (MVP style)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return null;

    // Check against configured admin email
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && user.email === adminEmail) {
        return user;
    }

    return null;
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
